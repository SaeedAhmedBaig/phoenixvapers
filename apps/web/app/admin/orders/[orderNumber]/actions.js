"use server";

/**
 * Order controls (spec §7.3) — hold/release (support & admin) and
 * cancel+refund (finance & admin). The API enforces the role and the legal
 * state transition; these actions just forward the operator's intent and
 * surface the result. Redirects live outside try/catch.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { operatorApi } from "@/lib/admin";

async function runAction(orderNumber, path, body) {
  let error = null;
  try {
    await operatorApi(`/admin/orders/${orderNumber}/${path}`, {
      method: "POST",
      ...(body ? { body } : {}),
    });
  } catch (e) {
    error = e.message ?? "Action failed";
  }
  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath("/admin/orders");
  const q = error ? `?error=${encodeURIComponent(error)}` : "?saved=1";
  redirect(`/admin/orders/${orderNumber}${q}`);
}

export async function holdOrderAction(formData) {
  await runAction(String(formData.get("orderNumber")), "hold");
}

export async function releaseOrderAction(formData) {
  await runAction(String(formData.get("orderNumber")), "release");
}

export async function cancelOrderAction(formData) {
  const orderNumber = String(formData.get("orderNumber"));
  const reason = String(formData.get("reason") ?? "").trim();
  await runAction(orderNumber, "cancel", reason ? { reason } : undefined);
}
