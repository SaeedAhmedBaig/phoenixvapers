"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Gift, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "../../lib/store";
import { strengthOptions } from "../../lib/utils";
import { Price } from "./price";
import { QuantityStepper } from "./quantity-stepper";
import { VariantSelector } from "./variant-selector";
import { AddToCartButton } from "./add-to-cart-button";
import { Button } from "../ui/button";

export function PdpPurchasePanel({ product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const options = strengthOptions(product.strength);
  const [selected, setSelected] = useState(options[0] ?? product.strength);
  const [qty, setQty] = useState(1);
  const [buying, setBuying] = useState(false);

  async function buyNow() {
    setBuying(true);
    try {
      await addItem(product, { strength: selected, qty });
      router.push("/checkout");
    } finally {
      setBuying(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-border bg-secondary p-5">
      <VariantSelector
        label={product.categorySlug === "coils" ? "Resistance" : "Nicotine strength"}
        options={options}
        selected={selected}
        onSelect={setSelected}
      />

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <Price minor={product.priceMinor} compareAtMinor={product.compareAtMinor} size="lg" />
        <QuantityStepper value={qty} onChange={setQty} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <AddToCartButton product={product} strength={selected} qty={qty} variant="default" className="w-full" />
        <Button variant="inverse" onClick={buyNow} disabled={buying || product.stockStatus === "out"} className="w-full">
          Buy now <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-5 grid gap-3 text-sm font-bold text-foreground sm:grid-cols-3">
        <span className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" /> Free over £30
        </span>
        <span className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" /> Age verified
        </span>
        <span className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-primary" /> Points eligible
        </span>
      </div>
    </div>
  );
}
