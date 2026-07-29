"use server";

/**
 * Staff administration actions (spec §3.2) — platform-admin only, enforced
 * by the API. These replace seeded/dummy operators: real accounts are
 * created here by a named admin, fully audited server-side.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { operatorApi } from "@/lib/admin";

function backWithError(message) {
  const url = new URL("/admin/staff", "http://local");
  url.searchParams.set("error", message);
  redirect(`${url.pathname}?${url.searchParams.toString()}`);
}

export async function createStaffAction(formData) {
  const body = {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
    firstName: String(formData.get("firstName") ?? "").trim(),
    lastName: String(formData.get("lastName") ?? "").trim(),
    role: String(formData.get("role") ?? ""),
  };

  try {
    await operatorApi("/admin/operators", { method: "POST", body });
  } catch (error) {
    backWithError(error.message ?? "Could not create staff account");
    return;
  }
  revalidatePath("/admin/staff");
  redirect("/admin/staff?saved=1");
}

export async function setStaffStatusAction(formData) {
  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? ""); // "suspend" | "activate"
  if (!id || !["suspend", "activate"].includes(action)) return;

  try {
    await operatorApi(`/admin/operators/${id}/${action}`, { method: "POST" });
  } catch (error) {
    backWithError(error.message ?? "Could not update staff account");
    return;
  }
  revalidatePath("/admin/staff");
  redirect("/admin/staff?saved=1");
}

function backWithErrorTo(id, message) {
  const url = new URL(`/admin/staff/${id}`, "http://local");
  url.searchParams.set("error", message);
  redirect(`${url.pathname}?${url.searchParams.toString()}`);
}

export async function updateStaffAction(formData) {
  const id = String(formData.get("id") ?? "");
  const body = {
    firstName: String(formData.get("firstName") ?? "").trim(),
    lastName: String(formData.get("lastName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    role: String(formData.get("role") ?? ""),
  };

  try {
    await operatorApi(`/admin/operators/${id}`, { method: "PATCH", body });
  } catch (error) {
    backWithErrorTo(id, error.message ?? "Could not update staff account");
    return;
  }
  revalidatePath("/admin/staff");
  revalidatePath(`/admin/staff/${id}`);
  redirect(`/admin/staff/${id}?saved=1`);
}

export async function resetStaffPasswordAction(formData) {
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await operatorApi(`/admin/operators/${id}/reset-password`, {
      method: "POST",
      body: { password },
    });
  } catch (error) {
    backWithErrorTo(id, error.message ?? "Could not reset password");
    return;
  }
  revalidatePath(`/admin/staff/${id}`);
  redirect(`/admin/staff/${id}?resetOk=1`);
}
