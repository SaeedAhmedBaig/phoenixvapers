"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Loader2, Lock } from "lucide-react";
import { formatPence } from "@phoenix/utils/money";

import { placeOrderAction } from "@/app/(shop)/checkout/actions";
import { Button } from "@/components/ui/button";

/**
 * Mock PSP test cards (spec §16.11). We never collect real card data — the
 * client only ever chooses an opaque token the sandbox PSP recognises,
 * exactly as a hosted-fields integration would hand back a token
 * [COMPLIANCE §6.4].
 */
const TEST_CARDS = [
  { token: "pm_card_ok", label: "Test card — approved" },
  { token: "pm_card_3ds_ok", label: "Test card — 3-D Secure challenge (passes)" },
  { token: "pm_card_declined", label: "Test card — declined" },
  { token: "pm_card_insufficient", label: "Test card — insufficient funds" },
];

/**
 * Checkout form. All totals shown here come from the server-priced context;
 * the only thing computed client-side is which delivery charge to add as
 * the shopper switches method — and the server re-derives and re-checks
 * every figure when the order is placed.
 */
export function CheckoutForm({ context }) {
  const { cart, addresses, deliveryMethods } = context;
  const hasAddress = addresses.length > 0;

  const [addressIndex, setAddressIndex] = useState(hasAddress ? addresses[0].index : 0);
  const [deliveryMethodId, setDeliveryMethodId] = useState(deliveryMethods[0]?.id ?? "");
  const [paymentMethodToken, setPaymentMethodToken] = useState(TEST_CARDS[0].token);
  const [state, formAction, pending] = useActionState(placeOrderAction, null);

  const method = deliveryMethods.find((m) => m.id === deliveryMethodId) ?? deliveryMethods[0];
  const deliveryMinor = method?.charge.totalMinor ?? 0;
  const grandTotalMinor = cart.totals.totalMinor + deliveryMinor;

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
      <input type="hidden" name="addressIndex" value={addressIndex} />
      <input type="hidden" name="deliveryMethodId" value={deliveryMethodId} />
      <input type="hidden" name="paymentMethodToken" value={paymentMethodToken} />

      <div className="space-y-8">
        {/* Delivery address */}
        <section>
          <h2 className="font-display text-lg font-medium">Delivery address</h2>
          {hasAddress ? (
            <ul className="mt-3 space-y-2">
              {addresses.map((a) => (
                <li key={a.index}>
                  <label className="border-border hover:border-primary/50 flex cursor-pointer items-start gap-3 border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      type="radio"
                      name="addressChoice"
                      className="mt-1"
                      checked={addressIndex === a.index}
                      onChange={() => setAddressIndex(a.index)}
                    />
                    <span className="text-sm">
                      <span className="font-medium">{a.label}</span>
                      <span className="text-muted-foreground block">
                        {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.postcode}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="border-border bg-muted/40 mt-3 border p-4 text-sm">
              You need a delivery address before checkout.{" "}
              <Link href="/account" className="text-pine font-medium underline">Add one in your account →</Link>
            </p>
          )}
        </section>

        {/* Delivery method */}
        <section>
          <h2 className="font-display text-lg font-medium">Delivery method</h2>
          <ul className="mt-3 space-y-2">
            {deliveryMethods.map((m) => (
              <li key={m.id}>
                <label className="border-border hover:border-primary/50 flex cursor-pointer items-center gap-3 border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    type="radio"
                    name="deliveryChoice"
                    checked={deliveryMethodId === m.id}
                    onChange={() => setDeliveryMethodId(m.id)}
                  />
                  <span className="flex-1 text-sm">
                    <span className="font-medium">{m.label}</span>
                    <span className="text-muted-foreground block text-xs">{m.description}</span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {m.charge.totalMinor === 0 ? "Free" : formatPence(m.charge.totalMinor)}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        {/* Payment */}
        <section>
          <h2 className="font-display text-lg font-medium">Payment</h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
            <Lock className="size-3.5" /> Sandbox PSP — card data is never entered or stored (tokens only).
          </p>
          <div className="mt-3 space-y-2">
            {TEST_CARDS.map((c) => (
              <label
                key={c.token}
                className="border-border hover:border-primary/50 flex cursor-pointer items-center gap-3 border p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <input
                  type="radio"
                  name="cardChoice"
                  checked={paymentMethodToken === c.token}
                  onChange={() => setPaymentMethodToken(c.token)}
                />
                {c.label}
              </label>
            ))}
          </div>
        </section>
      </div>

      {/* Summary + place order */}
      <aside className="border-border bg-card border p-5 lg:sticky lg:top-24">
        <h2 className="font-display text-lg font-medium">Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Products (net)" minor={cart.totals.netMinor} />
          <Row label="Duty" minor={cart.totals.dutyMinor} />
          <Row label="VAT" minor={cart.totals.vatMinor} />
          <Row label="Delivery" minor={deliveryMinor} free={deliveryMinor === 0} />
          <div className="border-border mt-2 flex justify-between border-t pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPence(grandTotalMinor)}</dd>
          </div>
        </dl>

        {state && state.ok === false ? (
          <p className="border-destructive/40 bg-destructive/5 text-destructive mt-4 border px-3 py-2 text-sm" role="alert">
            {state.message}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={pending || !hasAddress || !deliveryMethodId}
          className="mt-5 w-full"
          size="lg"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Placing order…
            </>
          ) : (
            `Pay ${formatPence(grandTotalMinor)}`
          )}
        </Button>
        <p className="text-muted-foreground mt-3 text-center text-xs">
          By placing this order you confirm you are 18 or over. Every parcel is age-checked on delivery.
        </p>
      </aside>
    </form>
  );
}

function Row({ label, minor, free }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{free ? "Free" : formatPence(minor)}</dd>
    </div>
  );
}
