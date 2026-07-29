"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Check, Loader2, Minus, Plus } from "lucide-react";

import { addToCartAction } from "@/app/(shop)/cart-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Basket line limit — mirrors the API's MAX_LINE_QUANTITY (§6.2). */
const MAX_QUANTITY = 10;

/** A human label for a variant, from its attribute values (falls back to SKU). */
function variantLabel(variant) {
  const parts = Object.values(variant.attributes ?? {});
  return parts.length ? parts.join(" · ") : variant.sku;
}

/**
 * Buy box (spec §6.2). Wires "Add to basket" to the cart API through a
 * Server Action; the actual add, pricing, and stock/limit checks happen
 * server-side — this component only collects variant and quantity.
 *
 * Subscriptions (Subscribe & save) land in Phase 8, so that path stays
 * disabled here rather than pretending to work.
 */
export function AddToCartForm({ product }) {
  const variants = product.variants ?? [];
  const sellable = variants.filter((v) => v.inStock && v.price);

  const [sku, setSku] = useState(sellable[0]?.sku ?? "");
  const [quantity, setQuantity] = useState(1);
  const [state, formAction, pending] = useActionState(addToCartAction, null);

  // Nothing purchasable — be honest, don't offer a dead button.
  if (sellable.length === 0) {
    return (
      <div className="space-y-3">
        <Button size="lg" className="w-full" disabled>
          Out of stock
        </Button>
        <p className="text-muted-foreground text-center text-xs">
          We&apos;ll restock soon — check back shortly.
        </p>
      </div>
    );
  }

  const hasChoice = variants.length > 1;

  return (
    <div className="space-y-4">
      {hasChoice ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Choose an option</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const disabled = !v.inStock || !v.price;
              const selected = v.sku === sku;
              return (
                <button
                  key={v.sku}
                  type="button"
                  disabled={disabled}
                  aria-pressed={selected}
                  onClick={() => setSku(v.sku)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:border-primary/50",
                    disabled && "cursor-not-allowed opacity-40 line-through",
                  )}
                >
                  {variantLabel(v)}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Quantity</span>
        <div className="border-border inline-flex items-center rounded-md border">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="text-muted-foreground hover:text-foreground flex size-9 items-center justify-center disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center text-sm font-medium tabular-nums" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={quantity >= MAX_QUANTITY}
            onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
            className="text-muted-foreground hover:text-foreground flex size-9 items-center justify-center disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <form action={formAction}>
        <input type="hidden" name="sku" value={sku} />
        <input type="hidden" name="quantity" value={quantity} />
        <input type="hidden" name="purchaseType" value="one-off" />
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Button size="lg" type="submit" disabled={pending || !sku} className="flex-1">
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Adding…
              </>
            ) : (
              "Add to basket"
            )}
          </Button>
          <Button size="lg" type="button" variant="outline" className="flex-1" disabled title="Subscriptions are coming soon">
            Subscribe &amp; save
          </Button>
        </div>
      </form>

      {state?.ok ? (
        <p className="border-primary/30 bg-primary/5 text-pine flex items-center justify-center gap-2 border px-4 py-2.5 text-sm" role="status">
          <Check className="size-4 shrink-0" />
          {state.message} ·{" "}
          <Link href="/basket" className="font-medium underline">
            View basket
          </Link>
        </p>
      ) : null}
      {state && state.ok === false ? (
        <p className="text-destructive text-center text-sm" role="alert">
          {state.message}
        </p>
      ) : (
        <p className="text-muted-foreground text-center text-xs">
          Subscribe &amp; save is coming soon. Every parcel is age-checked at the door.
        </p>
      )}
    </div>
  );
}
