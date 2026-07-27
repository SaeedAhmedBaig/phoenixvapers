"use server";

/**
 * Catalogue actions — operator session (role enforced by the API's
 * segregation-of-duties policy: merchandiser owns the lifecycle, compliance
 * officer owns the profile/approval). Redirects live OUTSIDE try/catch so a
 * success navigation is never swallowed as a bogus error.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { operatorApi } from "@/lib/admin";

/**
 * Parse the ProductImageUploader's hidden JSON field into a validated
 * `{url, alt}[]`. The uploader's own `required minLength={3}` on the alt
 * input already blocks a normal submission with bad entries — this is
 * defense in depth for a submission that bypassed client-side JS/HTML
 * validation, mirroring the API's own mediaItemSchema (alt >= 3 chars).
 */
function parseMediaJson(raw) {
  if (!raw) return [];
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((m) => m && typeof m.url === "string" && typeof m.alt === "string")
    .map((m) => ({ url: m.url.trim(), alt: m.alt.trim() }))
    .filter((m) => m.url && m.alt.length >= 3)
    .slice(0, 12); // mirrors the API's media.max(12)
}

/** Map the flat form into the create/update product DTO. */
function parseProductForm(formData) {
  const netPrice = formData.get("netPriceMinor");
  const strength = formData.get("strengthMgPerMl");
  const volume = formData.get("volumeMl");

  return {
    name: String(formData.get("name") ?? "").trim(),
    brand: String(formData.get("brand") ?? "").trim(),
    range: String(formData.get("range") ?? "").trim() || undefined,
    category: String(formData.get("category") ?? ""),
    description: String(formData.get("description") ?? "").trim(),
    media: parseMediaJson(String(formData.get("mediaJson") ?? "")),
    specification: {
      ...(strength ? { strengthMgPerMl: Number(strength) } : {}),
      ...(volume ? { volumeMl: Number(volume) } : {}),
      ...(formData.get("vgPg") ? { vgPg: String(formData.get("vgPg")).trim() } : {}),
    },
    provenance: {
      madeIn: String(formData.get("madeIn") ?? "United Kingdom").trim(),
      batchTested: formData.get("batchTested") === "on",
    },
    variants: [
      {
        sku: String(formData.get("sku") ?? "").trim().toUpperCase(),
        attributes: {},
        netPriceMinor: netPrice ? Number(netPrice) : undefined,
        inStockStub: formData.get("inStockStub") !== "off",
      },
    ],
  };
}

export async function createProductAction(formData) {
  let product;
  try {
    product = await operatorApi("/admin/products", {
      method: "POST",
      body: parseProductForm(formData),
    });
  } catch (error) {
    redirect(`/admin/products/new?error=${encodeURIComponent(error.message)}`);
    return;
  }
  revalidatePath("/admin/products");
  redirect(`/admin/products/${product._id ?? product.id}`);
}

/** A one-arg lifecycle transition (submit/publish/retire/approve/delete). */
async function transition(id, path, method = "POST") {
  let ok = true;
  let message = "";
  try {
    await operatorApi(`/admin/products/${id}${path}`, { method });
  } catch (error) {
    ok = false;
    message = error.message ?? "Action failed";
  }
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  if (!ok) redirect(`/admin/products/${id}?error=${encodeURIComponent(message)}`);
}

export async function submitForReviewAction(formData) {
  await transition(String(formData.get("id")), "/submit-for-review");
  redirect(`/admin/products/${formData.get("id")}?saved=1`);
}
export async function publishProductAction(formData) {
  await transition(String(formData.get("id")), "/publish");
  redirect(`/admin/products/${formData.get("id")}?saved=1`);
}
export async function retireProductAction(formData) {
  await transition(String(formData.get("id")), "/retire");
  redirect(`/admin/products/${formData.get("id")}?saved=1`);
}
export async function approveProductAction(formData) {
  await transition(String(formData.get("id")), "/approve");
  redirect(`/admin/products/${formData.get("id")}?saved=1`);
}
export async function deleteDraftAction(formData) {
  await transition(String(formData.get("id")), "", "DELETE");
  redirect("/admin/products");
}

/** Compliance officer: set/replace the profile (clears any prior approval). */
export async function setComplianceProfileAction(formData) {
  const id = String(formData.get("id"));
  const warnings = String(formData.get("mandatedWarnings") ?? "")
    .split("\n")
    .map((w) => w.trim())
    .filter(Boolean);
  const strength = formData.get("nicotineStrengthMgPerMl");
  const volume = formData.get("containerVolumeMl");
  const notification = String(formData.get("notificationNumber") ?? "").trim();

  const body = {
    productType: String(formData.get("productType") ?? ""),
    dutyClassification: String(formData.get("dutyClassification") ?? ""),
    ...(strength !== null && strength !== "" ? { nicotineStrengthMgPerMl: Number(strength) } : {}),
    ...(volume !== null && volume !== "" ? { containerVolumeMl: Number(volume) } : {}),
    ...(notification ? { notificationNumber: notification } : {}),
    mandatedWarnings: warnings,
  };

  try {
    await operatorApi(`/admin/products/${id}/compliance-profile`, { method: "PUT", body });
  } catch (error) {
    redirect(`/admin/products/${id}?error=${encodeURIComponent(error.message)}`);
    return;
  }
  revalidatePath(`/admin/products/${id}`);
  redirect(`/admin/products/${id}?saved=1`);
}

/**
 * Merchandiser: replace a product's image gallery. Only ever succeeds on a
 * DRAFT product — the API's updateDraft() rejects anything past draft, by
 * design (a sellable product's data is frozen; edits go through retire →
 * new draft, spec §16.7), so this deliberately does not try to work around
 * that on non-draft products.
 */
export async function updateProductMediaAction(formData) {
  const id = String(formData.get("id"));
  const media = parseMediaJson(String(formData.get("mediaJson") ?? ""));
  try {
    await operatorApi(`/admin/products/${id}`, { method: "PATCH", body: { media } });
  } catch (error) {
    redirect(`/admin/products/${id}?error=${encodeURIComponent(error.message)}`);
    return;
  }
  revalidatePath(`/admin/products/${id}`);
  redirect(`/admin/products/${id}?saved=1`);
}

export async function rejectProductAction(formData) {
  const id = String(formData.get("id"));
  const reason = String(formData.get("reason") ?? "").trim();
  try {
    await operatorApi(`/admin/products/${id}/reject`, { method: "POST", body: { reason } });
  } catch (error) {
    redirect(`/admin/products/${id}?error=${encodeURIComponent(error.message)}`);
    return;
  }
  revalidatePath(`/admin/products/${id}`);
  redirect(`/admin/products/${id}?saved=1`);
}
