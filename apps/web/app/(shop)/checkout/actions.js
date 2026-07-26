"use server";

/**
 * Checkout submission (spec §6.3) [COMPLIANCE].
 *
 * This is the thinnest possible client of the API's checkout orchestration:
 * we forward the customer's choices (which saved address, which delivery
 * method, which PSP token) and let the server do the real work — assert age
 * verification, revalidate the basket, take payment, and create the order,
 * all fail-closed. The storefront never computes money or asserts
 * eligibility itself.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { AuthRequiredError, customerApi } from "@/lib/auth";

export async function placeOrderAction(_prevState, formData) {
  const payload = {
    addressIndex: Number(formData.get("addressIndex")),
    deliveryMethodId: String(formData.get("deliveryMethodId") ?? ""),
    paymentMethodToken: String(formData.get("paymentMethodToken") ?? ""),
  };

  let order;
  try {
    order = await customerApi("/checkout", { method: "POST", body: payload });
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return { ok: false, message: "Your session expired — please sign in again." };
    }
    // The API returns honest, customer-safe messages for declines, PSP
    // outages, expired verification, and stale-basket conflicts (§6.3).
    return { ok: false, message: error.message ?? "Checkout could not be completed." };
  }

  // Order placed: the basket was consumed server-side — clear the badge.
  revalidatePath("/", "layout");
  // Land on the confirmation (order detail) page.
  redirect(`/account/orders/${order.orderNumber}?placed=1`);
}
