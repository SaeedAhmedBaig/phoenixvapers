"use client";

import { useActionState } from "react";
import { Check, Loader2, Plus } from "lucide-react";

import { addToCartAction } from "@/app/(shop)/cart-actions";
import { cn } from "@/lib/utils";

/**
 * One-tap add-to-basket straight from the PLP/Home grid — the PDP's full
 * `AddToCartForm` needs a variant choice and quantity, but every product
 * we sell so far has exactly one purchasable variant, so a card shouldn't
 * force a whole page visit just to add it. Renders nothing when there's
 * no in-stock SKU to add (mirrors AddToCartForm's own "be honest, don't
 * offer a dead button" rule).
 *
 * Sits as an absolutely-positioned SIBLING of the card's own <Link> (see
 * ProductCard), not nested inside it — a <button> inside an <a> is invalid
 * HTML, and stopPropagation alone doesn't fix that.
 */
export function QuickAddButton({ sku, className }) {
  const [state, formAction, pending] = useActionState(addToCartAction, null);

  if (!sku) return null;

  return (
    <form
      action={formAction}
      onClick={(e) => e.stopPropagation()}
      className={cn("absolute", className)}
    >
      <input type="hidden" name="sku" value={sku} />
      <input type="hidden" name="quantity" value={1} />
      <input type="hidden" name="purchaseType" value="one-off" />
      <button
        type="submit"
        disabled={pending}
        aria-label="Add to basket"
        title="Add to basket"
        className={cn(
          "flex size-9 items-center justify-center rounded-full border shadow-sm transition-colors disabled:cursor-not-allowed",
          state?.ok
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground",
        )}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : state?.ok ? (
          <Check className="size-4" />
        ) : (
          <Plus className="size-4" />
        )}
      </button>
    </form>
  );
}
