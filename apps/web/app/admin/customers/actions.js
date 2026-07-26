"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { operatorApi } from "@/lib/admin";

/** Compliance officer: clear a soft-lock after human review (audited). */
export async function unlockCustomerAction(formData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  try {
    await operatorApi(`/admin/verification/${id}/unlock`, { method: "POST" });
  } catch (error) {
    redirect(`/admin/customers?error=${encodeURIComponent(error.message)}`);
    return;
  }
  revalidatePath("/admin/customers");
  redirect("/admin/customers?saved=1");
}
