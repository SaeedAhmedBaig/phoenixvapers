import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { formatPence } from "@phoenix/utils/money";

import { Button } from "@/components/ui/button";
import { AuthRequiredError, customerApi } from "@/lib/auth";
import { orderStatusClasses, orderStatusLabel } from "@/lib/orders";

export const metadata = { title: "Order" };

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function OrderDetailPage({ params, searchParams }) {
  const { orderNumber } = await params;
  const sp = await searchParams;

  let order;
  try {
    order = await customerApi(`/orders/${orderNumber}`);
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect(`/auth/refresh?next=${encodeURIComponent(`/account/orders/${orderNumber}`)}`);
    }
    if (/\b404\b|not found/i.test(error?.message ?? "")) notFound();
    throw error;
  }
  if (!order) notFound();

  const justPlaced = sp?.placed === "1";
  const addr = order.delivery.address;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {justPlaced ? (
        <div className="border-primary/30 bg-primary/5 mb-8 flex items-start gap-3 border p-5">
          <CheckCircle2 className="text-pine mt-0.5 size-6 shrink-0" />
          <div>
            <h1 className="font-display text-xl font-medium">Thank you — your order is confirmed</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              We&apos;ve emailed your confirmation to {order.email ?? "your inbox"}. Your parcel is age-checked on delivery.
            </p>
          </div>
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-pine text-xs font-semibold tracking-widest uppercase">Order</p>
          <h2 className="font-display mt-1 font-mono text-2xl font-medium">{order.orderNumber}</h2>
          <p className="text-muted-foreground mt-1 text-sm">Placed {dateFmt.format(new Date(order.placedAt))}</p>
        </div>
        <span className={`border px-2.5 py-1 text-xs font-medium ${orderStatusClasses(order.status)}`}>
          {orderStatusLabel(order.status)}
        </span>
      </div>

      {/* Lines */}
      <section className="border-border bg-card border">
        <ul className="divide-border divide-y">
          {order.lines.map((line) => {
            const attrs = Object.values(line.attributes ?? {}).join(" · ");
            return (
              <li key={`${line.sku}-${line.purchaseType}`} className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0">
                  {line.brand ? (
                    <p className="text-pine text-xs font-semibold tracking-wide uppercase">{line.brand}</p>
                  ) : null}
                  <p className="mt-0.5 text-sm font-medium">{line.name}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {attrs ? `${attrs} · ` : ""}Qty {line.quantity}
                    {line.purchaseType === "subscription" ? " · Subscription" : ""}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums">{formatPence(line.line.totalMinor)}</p>
              </li>
            );
          })}
        </ul>

        {/* Totals */}
        <dl className="border-border space-y-2 border-t p-4 text-sm">
          <Row label="Products (net)" minor={order.goodsTotals.netMinor} />
          <Row label="Duty" minor={order.goodsTotals.dutyMinor} />
          <Row label="VAT" minor={order.goodsTotals.vatMinor} />
          <Row
            label={`Delivery — ${order.delivery.methodLabel}`}
            minor={order.delivery.charge.totalMinor}
            free={order.delivery.charge.totalMinor === 0}
          />
          <div className="border-border mt-1 flex justify-between border-t pt-3 text-base font-semibold">
            <dt>Total paid</dt>
            <dd className="tabular-nums">{formatPence(order.totals.totalMinor)}</dd>
          </div>
        </dl>
      </section>

      {/* Delivery + payment */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="border-border bg-card border p-4">
          <h3 className="text-sm font-medium">Delivery address</h3>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {addr.line1}{addr.line2 ? <>, {addr.line2}</> : null}
            <br />
            {addr.city}, {addr.postcode}
            <br />
            {addr.country}
          </p>
        </div>
        <div className="border-border bg-card border p-4">
          <h3 className="text-sm font-medium">Payment</h3>
          <p className="text-muted-foreground mt-2 text-sm capitalize">{order.payment?.status ?? "—"}</p>
        </div>
      </div>

      {/* Timeline */}
      {order.timeline?.length ? (
        <section className="mt-6">
          <h3 className="text-sm font-medium">Progress</h3>
          <ol className="border-border mt-3 space-y-3 border-l pl-4">
            {order.timeline.map((event, i) => (
              <li key={i} className="relative text-sm">
                <span className="bg-primary absolute -left-[1.30rem] top-1.5 size-2 rounded-full" aria-hidden />
                <p className="font-medium">{orderStatusLabel(event.to)}</p>
                <p className="text-muted-foreground text-xs">
                  {dateFmt.format(new Date(event.at))}{event.note ? ` · ${event.note}` : ""}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="outline"><Link href="/account/orders">All orders</Link></Button>
        <Button asChild><Link href="/c/e-liquids">Continue shopping</Link></Button>
      </div>
    </div>
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
