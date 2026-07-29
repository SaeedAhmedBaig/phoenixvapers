import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import { formatPence } from "@phoenix/utils/money";

import { updateLineAction, removeLineAction } from "../cart-actions";
import { SectionEyebrow } from "@/components/home/section-eyebrow";
import { Button } from "@/components/ui/button";
import { sessionState } from "@/lib/auth";
import { readCart } from "@/lib/cart";

export const metadata = { title: "Basket" };

/** Line quantity limit — mirrors the API's MAX_LINE_QUANTITY (§6.2). */
const MAX_QUANTITY = 10;

const ISSUE_COPY = {
  "no-longer-available": "No longer available",
  "out-of-stock": "Out of stock",
};

/** Small image cell — real photography if we have it, a tint block if not. */
function LineImage({ line }) {
  const url = line.image?.url;
  const usable = url && !url.includes("placeholder.svg");
  if (usable) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={line.image?.alt ?? line.name} loading="lazy" className="size-full object-cover" />;
  }
  return <div className="bg-accent/60 size-full" aria-hidden />;
}

export default async function BasketPage() {
  const [cart, session] = await Promise.all([readCart(), sessionState()]);
  const signedIn = session.hasAccess || session.hasRefresh;
  const isEmpty = cart.lines.length === 0;
  const purchasable = cart.lines.filter((l) => l.available);
  const canCheckout = purchasable.length > 0 && !cart.needsAttention;

  if (isEmpty) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <div className="bg-accent/60 mx-auto flex size-14 items-center justify-center rounded-full">
          <ShoppingBag className="text-primary/50 size-6" />
        </div>
        <SectionEyebrow className="mt-6">Cart</SectionEyebrow>
        <h1 className="font-display mt-2 text-2xl font-medium">Your basket is empty</h1>
        <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
          Browse UK-made, batch-tested products and add them here. Prices show duty and VAT included, with nothing hidden until checkout.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className=""><Link href="/c/e-liquids">Continue shopping</Link></Button>
          {!signedIn ? (
            <Button asChild variant="outline" className=""><Link href="/register">Create account</Link></Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <SectionEyebrow>Cart</SectionEyebrow>
      <h1 className="font-display mt-2 text-3xl font-medium">Your basket</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"} · prices include duty and VAT
      </p>

      {cart.needsAttention ? (
        <p className="border-destructive/40 bg-destructive/5 text-destructive mt-6 border px-4 py-3 text-sm" role="alert">
          Some items below are no longer available. Remove them to continue to checkout.
        </p>
      ) : null}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
        {/* Lines */}
        <ul className="divide-border border-border divide-y border-y">
          {cart.lines.map((line) => {
            const attrs = Object.values(line.attributes ?? {}).join(" · ");
            return (
              <li key={`${line.sku}-${line.purchaseType}`} className="flex gap-4 py-5">
                <div className="border-border size-20 shrink-0 overflow-hidden border sm:size-24">
                  <LineImage line={line} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {line.brand ? (
                        <p className="text-pine text-xs font-semibold tracking-wide uppercase">{line.brand}</p>
                      ) : null}
                      <h2 className="mt-0.5 truncate text-sm font-medium">
                        {line.slug ? (
                          <Link href={`/p/${line.slug}`} className="hover:underline">{line.name ?? line.sku}</Link>
                        ) : (
                          line.name ?? line.sku
                        )}
                      </h2>
                      {attrs ? <p className="text-muted-foreground mt-0.5 text-xs">{attrs}</p> : null}
                      {line.purchaseType === "subscription" ? (
                        <span className="border-primary/30 text-pine mt-1 inline-block border px-1.5 py-0.5 text-[10px] font-medium uppercase">
                          Subscription
                        </span>
                      ) : null}
                      {!line.available ? (
                        <p className="text-destructive mt-1 text-xs font-medium">
                          {ISSUE_COPY[line.issue] ?? "Unavailable"}
                        </p>
                      ) : null}
                    </div>

                    {/* Line total */}
                    <div className="text-right">
                      {line.available && line.line ? (
                        <p className="text-sm font-semibold tabular-nums">{formatPence(line.line.totalMinor)}</p>
                      ) : null}
                      {line.available && line.unit ? (
                        <p className="text-muted-foreground mt-0.5 text-xs tabular-nums">
                          {formatPence(line.unit.totalMinor)} each
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Quantity + remove */}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    {line.available ? (
                      <div className="border-border inline-flex items-center rounded-md border">
                        <form action={updateLineAction}>
                          <input type="hidden" name="sku" value={line.sku} />
                          <input type="hidden" name="quantity" value={line.quantity - 1} />
                          <button
                            type="submit"
                            aria-label="Decrease quantity"
                            disabled={line.quantity <= 1}
                            className="text-muted-foreground hover:text-foreground flex size-8 items-center justify-center text-lg disabled:opacity-40"
                          >
                            −
                          </button>
                        </form>
                        <span className="w-8 text-center text-sm font-medium tabular-nums">{line.quantity}</span>
                        <form action={updateLineAction}>
                          <input type="hidden" name="sku" value={line.sku} />
                          <input type="hidden" name="quantity" value={line.quantity + 1} />
                          <button
                            type="submit"
                            aria-label="Increase quantity"
                            disabled={line.quantity >= MAX_QUANTITY}
                            className="text-muted-foreground hover:text-foreground flex size-8 items-center justify-center text-lg disabled:opacity-40"
                          >
                            +
                          </button>
                        </form>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">Qty {line.quantity}</span>
                    )}

                    <form action={removeLineAction}>
                      <input type="hidden" name="sku" value={line.sku} />
                      <button
                        type="submit"
                        className="text-muted-foreground hover:text-destructive inline-flex items-center gap-1.5 text-xs transition-colors"
                      >
                        <Trash2 className="size-3.5" /> Remove
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Summary */}
        <aside className="border-border bg-card border p-5 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-medium">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Products (net)" minor={cart.totals.netMinor} />
            <Row label="Vaping Products Duty" minor={cart.totals.dutyMinor} />
            <Row label="VAT" minor={cart.totals.vatMinor} />
            <div className="border-border mt-2 flex justify-between border-t pt-3 text-base font-semibold">
              <dt>Goods total</dt>
              <dd className="tabular-nums">{formatPence(cart.totals.totalMinor)}</dd>
            </div>
          </dl>
          <p className="text-muted-foreground mt-3 text-xs">Delivery is calculated at checkout.</p>

          <div className="mt-5">
            {/* A disabled checkout must be a real <button> — `disabled` on an
                <a> (via asChild) is invalid HTML: it neither styles nor blocks
                the click, so we render a genuine disabled button instead of a
                dead href="#". */}
            {canCheckout ? (
              <Button asChild className="w-full">
                <Link href={signedIn ? "/checkout" : "/login?next=/checkout"}>
                  {signedIn ? "Proceed to checkout" : "Sign in to check out"}
                </Link>
              </Button>
            ) : (
              <Button disabled className="w-full">
                {signedIn ? "Proceed to checkout" : "Sign in to check out"}
              </Button>
            )}
            <Button asChild variant="ghost" className="mt-2 w-full">
              <Link href="/c/e-liquids">Continue shopping</Link>
            </Button>
          </div>

          <p className="text-muted-foreground mt-4 text-center text-xs">
            Age-verified at checkout and again at your door.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, minor }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{formatPence(minor)}</dd>
    </div>
  );
}
