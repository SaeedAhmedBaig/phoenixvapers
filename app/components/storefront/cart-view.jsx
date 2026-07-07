"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useCart } from "../../lib/store";
import { formatMinor } from "../../lib/utils";
import { ProductVisual } from "./product-visual";
import { QuantityStepper } from "./quantity-stepper";
import { FreeShippingMeter } from "./free-shipping-meter";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

export function CartView() {
  const {
    items,
    ready,
    updateQty,
    removeItem,
    subtotalMinor,
    discountMinor,
    deliveryMinor,
    totalMinor,
    freeShippingRemainingMinor,
    freeShippingThresholdMinor,
    qualifiesForFreeShipping,
    pointsPreview,
  } = useCart();

  if (!ready) {
    return (
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-xl bg-secondary text-primary">
          <ShoppingBag className="h-9 w-9" />
        </span>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-foreground">Your basket is empty</h1>
        <p className="mt-3 text-base font-bold text-muted-foreground">
          Browse UK-made e-liquids, authentic hardware, coils, and CBD.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/shop">
            Start shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_380px]">
      <div className="grid gap-4">
        {items.map((item) => (
          <article
            key={item.itemId}
            className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-[6rem_1fr_auto] sm:items-start"
          >
            <Link href={`/product/${item.productSlug}`} className="block h-24 w-24 overflow-hidden rounded-3xl">
              <ProductVisual product={{ categorySlug: item.category }} className="h-full w-full" iconClassName="h-8 w-8" />
            </Link>
            <div>
              <h2 className="text-lg font-black tracking-tight text-foreground">
                <Link className="hover:text-primary" href={`/product/${item.productSlug}`}>
                  {item.name}
                </Link>
              </h2>
              <p className="mt-1 text-sm font-bold text-muted-foreground">
                {item.format}
                {item.strength ? ` · ${item.strength}` : ""}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <QuantityStepper value={item.qty} onChange={(q) => updateQty(item.itemId, q)} />
                <button
                  type="button"
                  onClick={() => removeItem(item.itemId)}
                  className="inline-flex items-center gap-1.5 text-sm font-black text-muted-foreground transition hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Remove
                </button>
              </div>
            </div>
            <strong className="text-xl font-black tracking-tight text-foreground">{formatMinor(item.lineTotalMinor)}</strong>
          </article>
        ))}
      </div>

      <aside className="rounded-xl border border-border bg-card p-6 shadow-xl lg:sticky lg:top-24 lg:h-fit">
        <h2 className="text-2xl font-black tracking-tight text-foreground">Order summary</h2>
        <div className="mt-5 grid gap-3">
          <SummaryRow label="Subtotal" value={formatMinor(subtotalMinor)} />
          {discountMinor > 0 ? <SummaryRow label="Bundle discount" value={`-${formatMinor(discountMinor)}`} accent /> : null}
          <SummaryRow label="Tracked 24 delivery" value={deliveryMinor === 0 ? "Free" : formatMinor(deliveryMinor)} />
          <SummaryRow label="Loyalty points earned" value={`${pointsPreview} pts`} />
          <div className="flex items-center justify-between pt-2">
            <span className="text-base font-black text-foreground">Total</span>
            <strong className="text-2xl font-black tracking-tight text-foreground">{formatMinor(totalMinor)}</strong>
          </div>
        </div>

        <div className="mt-5">
          <FreeShippingMeter
            remainingMinor={freeShippingRemainingMinor}
            thresholdMinor={freeShippingThresholdMinor}
            qualifies={qualifiesForFreeShipping}
          />
        </div>

        <div className="mt-5 grid gap-2 text-sm font-bold text-muted-foreground">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> 18+ age verification required
          </span>
          <span className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" /> Royal Mail tracked services
          </span>
        </div>

        <Button className="mt-6 w-full" asChild>
          <Link href="/checkout">
            Continue to checkout <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Link href="/shop" className="mt-3 block text-center text-sm font-black text-primary">
          Keep shopping
        </Link>
      </aside>
    </section>
  );
}

function SummaryRow({ label, value, accent = false }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3">
      <span className="font-bold text-muted-foreground">{label}</span>
      <strong className={accent ? "text-primary" : "text-foreground"}>{value}</strong>
    </div>
  );
}
