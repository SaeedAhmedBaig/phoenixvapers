"use client";

import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../../lib/store";
import { formatMinor } from "../../lib/utils";
import { Sheet, SheetContent, SheetHeader } from "../ui/sheet";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { QuantityStepper } from "./quantity-stepper";
import { FreeShippingMeter } from "./free-shipping-meter";
import { ProductVisual } from "./product-visual";

export function CartSheet() {
  const {
    items,
    drawerOpen,
    closeDrawer,
    openDrawer,
    updateQty,
    removeItem,
    subtotalMinor,
    freeShippingRemainingMinor,
    freeShippingThresholdMinor,
    qualifiesForFreeShipping,
    count,
  } = useCart();

  return (
    <Sheet open={drawerOpen} onOpenChange={(open) => (open ? openDrawer() : closeDrawer())}>
      <SheetContent title="Your basket">
        <SheetHeader onClose={closeDrawer}>
          <strong className="flex items-center gap-2 text-lg font-black text-foreground">
            <ShoppingBag className="h-5 w-5 text-primary" /> Your basket
            <span className="text-muted-foreground">({count})</span>
          </strong>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-3xl bg-secondary text-primary">
              <ShoppingBag className="h-7 w-7" />
            </span>
            <p className="text-lg font-black text-foreground">Your basket is empty</p>
            <p className="text-sm font-bold text-muted-foreground">Add e-liquids, kits, or coils to get started.</p>
            <Button onClick={closeDrawer} asChild>
              <Link href="/shop">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b border-border px-5 py-3">
              <FreeShippingMeter
                remainingMinor={freeShippingRemainingMinor}
                thresholdMinor={freeShippingThresholdMinor}
                qualifies={qualifiesForFreeShipping}
              />
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="grid gap-3">
                {items.map((item) => (
                  <article key={item.itemId} className="grid grid-cols-[4rem_1fr_auto] items-center gap-3 rounded-3xl border border-border bg-background/40 p-3">
                    <ProductVisual product={{ categorySlug: item.category }} className="h-16 w-16 rounded-2xl" iconClassName="h-7 w-7" />
                    <div className="min-w-0">
                      <strong className="block truncate text-sm font-black text-foreground">{item.name}</strong>
                      <span className="text-xs font-bold text-muted-foreground">
                        {item.strength ? `${item.strength} · ` : ""}
                        {formatMinor(item.unitPriceMinor)}
                      </span>
                      <div className="mt-2">
                        <QuantityStepper size="sm" value={item.qty} onChange={(q) => updateQty(item.itemId, q)} />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <strong className="text-sm font-black text-foreground">{formatMinor(item.lineTotalMinor)}</strong>
                      <button
                        type="button"
                        onClick={() => removeItem(item.itemId)}
                        className="text-muted-foreground transition hover:text-destructive"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="border-t border-border px-5 py-4">
              <div className="flex items-center justify-between text-sm font-bold text-muted-foreground">
                <span>Subtotal</span>
                <strong className="text-lg font-black text-foreground">{formatMinor(subtotalMinor)}</strong>
              </div>
              <p className="mt-1 text-xs font-bold text-muted-foreground">Delivery and loyalty points confirmed at checkout.</p>
              <div className="mt-4 grid gap-2">
                <Button asChild onClick={closeDrawer}>
                  <Link href="/checkout">Checkout</Link>
                </Button>
                <Button variant="outline" asChild onClick={closeDrawer}>
                  <Link href="/cart">View basket</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
