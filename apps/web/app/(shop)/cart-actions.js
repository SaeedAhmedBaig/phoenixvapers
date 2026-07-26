"use server";

/**
 * Basket mutations (spec §6.2) — the storefront's write path to the cart.
 *
 * All server-side: the browser posts a form, we attach the session's
 * credentials and talk to the API. After every mutation we revalidate the
 * layout (header badge) and the basket page so the UI reflects the live,
 * re-priced basket — never a stale client copy.
 */

import { revalidatePath } from "next/cache";

import { PurchaseType, mutateCart } from "@/lib/cart";

/** Re-render the header badge and the basket after any change. */
function revalidateBasketSurfaces() {
  revalidatePath("/", "layout");
  revalidatePath("/basket");
}

/**
 * Add a SKU to the basket. Used by the PDP via `useActionState`, so it
 * takes the previous state first and returns a `{ ok, message }` result
 * the button can surface inline.
 */
export async function addToCartAction(_prevState, formData) {
  const sku = String(formData.get("sku") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);
  const purchaseType =
    formData.get("purchaseType") === PurchaseType.SUBSCRIPTION
      ? PurchaseType.SUBSCRIPTION
      : PurchaseType.ONE_OFF;

  if (!sku) return { ok: false, message: "Choose an option first" };

  try {
    await mutateCart("/cart/items", {
      method: "POST",
      body: { sku, quantity, purchaseType },
    });
  } catch (error) {
    return { ok: false, message: error.message ?? "Could not add to basket" };
  }

  revalidateBasketSurfaces();
  return { ok: true, message: "Added to basket" };
}

/** Change a line's quantity (basket page stepper). Progressive-enhancement
 *  form action — receives FormData only. */
export async function updateLineAction(formData) {
  const sku = String(formData.get("sku") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);
  if (!sku) return;

  try {
    await mutateCart(`/cart/items/${encodeURIComponent(sku)}`, {
      method: "PATCH",
      body: { quantity },
    });
  } catch {
    // Limits are re-checked server-side; a rejected change just leaves the
    // basket as it was. The revalidate below re-renders the true state.
  }

  revalidateBasketSurfaces();
}

/** Remove a line entirely. */
export async function removeLineAction(formData) {
  const sku = String(formData.get("sku") ?? "");
  if (!sku) return;

  try {
    await mutateCart(`/cart/items/${encodeURIComponent(sku)}`, {
      method: "DELETE",
    });
  } catch {
    /* already gone is fine — revalidate shows the truth */
  }

  revalidateBasketSurfaces();
}
