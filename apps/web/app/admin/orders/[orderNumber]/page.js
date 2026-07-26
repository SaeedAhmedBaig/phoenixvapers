import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPence } from "@phoenix/utils/money";

import { cancelOrderAction, holdOrderAction, releaseOrderAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { operatorApi, requireOperator } from "@/lib/admin";
import { orderStatusClasses, orderStatusLabel } from "@/lib/orders";

export const metadata = { title: "Order" };

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
});

export default async function AdminOrderDetail({ params, searchParams }) {
  const { orderNumber } = await params;
  const sp = await searchParams;
  const operator = await requireOperator();
  let order;
  try {
    order = await operatorApi(`/admin/orders/${orderNumber}`);
  } catch {
    notFound();
  }
  const addr = order.delivery.address;

  const role = operator.role;
  const canHold = ["platform_admin", "customer_support"].includes(role);
  const canCancel = ["platform_admin", "finance"].includes(role);
  const isAccepted = order.status === "accepted";
  const isOnHold = order.status === "on_hold";
  const showActions = (canHold && (isAccepted || isOnHold)) || (canCancel && (isAccepted || isOnHold));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-pine text-xs font-semibold tracking-widest uppercase">Order</p>
          <h1 className="font-display mt-1 font-mono text-2xl font-medium">{order.orderNumber}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{order.email} · placed {dateFmt.format(new Date(order.placedAt))}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`border px-2.5 py-1 text-xs font-medium ${orderStatusClasses(order.status)}`}>{orderStatusLabel(order.status)}</span>
          <Button asChild variant="outline" size="sm"><a href={`/admin/orders/${order.orderNumber}/invoice`} target="_blank" rel="noopener">Invoice PDF</a></Button>
          <Button asChild variant="outline" size="sm"><a href={`/admin/orders/${order.orderNumber}/compliance`} target="_blank" rel="noopener">Compliance pack</a></Button>
          <Button asChild variant="outline" size="sm"><Link href="/admin/orders">Back</Link></Button>
        </div>
      </div>

      {sp?.error ? <p className="border-destructive/40 bg-destructive/5 text-destructive border px-4 py-2 text-sm" role="alert">{sp.error}</p> : null}
      {sp?.saved ? <p className="border-primary/30 bg-primary/5 text-pine border px-4 py-2 text-sm">Order updated.</p> : null}

      {showActions ? (
        <Card className="rounded-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {canHold && isAccepted ? (
                <form action={holdOrderAction}>
                  <input type="hidden" name="orderNumber" value={order.orderNumber} />
                  <Button type="submit" size="sm" variant="outline">Place on hold</Button>
                </form>
              ) : null}
              {canHold && isOnHold ? (
                <form action={releaseOrderAction}>
                  <input type="hidden" name="orderNumber" value={order.orderNumber} />
                  <Button type="submit" size="sm">Release hold</Button>
                </form>
              ) : null}
            </div>

            {canCancel && (isAccepted || isOnHold) ? (
              <form action={cancelOrderAction} className="border-border flex flex-wrap items-end gap-2 border-t pt-4">
                <input type="hidden" name="orderNumber" value={order.orderNumber} />
                <div className="flex-1 space-y-1">
                  <label htmlFor="reason" className="text-muted-foreground text-xs">Cancellation reason (optional)</label>
                  <Input id="reason" name="reason" placeholder="e.g. customer request" className="h-9" />
                </div>
                <Button type="submit" size="sm" variant="destructive">Cancel &amp; refund</Button>
              </form>
            ) : null}
            {order.payment?.status === "captured" ? (
              <p className="text-muted-foreground text-xs">Cancelling refunds the captured payment ({formatPence(order.totals.totalMinor)}) via the PSP before the order is cancelled.</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-none shadow-sm">
        <CardHeader><CardTitle className="text-base">Lines</CardTitle></CardHeader>
        <CardContent className="p-0">
          <ul className="divide-border divide-y">
            {order.lines.map((line) => (
              <li key={`${line.sku}-${line.purchaseType}`} className="flex items-start justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{line.name}</p>
                  <p className="text-muted-foreground font-mono text-xs">{line.sku} · qty {line.quantity}</p>
                </div>
                <p className="text-sm font-semibold tabular-nums">{formatPence(line.line.totalMinor)}</p>
              </li>
            ))}
          </ul>
          <dl className="border-border space-y-1.5 border-t p-5 text-sm">
            <Row label="Products (net)" minor={order.goodsTotals.netMinor} />
            <Row label="Duty" minor={order.goodsTotals.dutyMinor} />
            <Row label="VAT" minor={order.goodsTotals.vatMinor} />
            <Row label={`Delivery — ${order.delivery.methodLabel}`} minor={order.delivery.charge.totalMinor} />
            <div className="border-border mt-1 flex justify-between border-t pt-2 text-base font-semibold">
              <dt>Total</dt><dd className="tabular-nums">{formatPence(order.totals.totalMinor)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Delivery</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {addr.line1}{addr.line2 ? <>, {addr.line2}</> : null}<br />
              {addr.city}, {addr.postcode}<br />{addr.country}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Payment & compliance</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Status:</span> <span className="capitalize">{order.payment?.status ?? "—"}</span></p>
            <p className="truncate"><span className="text-muted-foreground">Intent:</span> <span className="font-mono text-xs">{order.payment?.intentId ?? "—"}</span></p>
            <p className="truncate"><span className="text-muted-foreground">AV evidence:</span> <span className="font-mono text-xs">{order.verification?.evidenceRef ?? "—"}</span></p>
            {order.verification?.expiresAt ? (
              <p><span className="text-muted-foreground">AV expires:</span> {dateFmt.format(new Date(order.verification.expiresAt))}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none shadow-sm">
        <CardHeader><CardTitle className="text-base">Audit timeline</CardTitle></CardHeader>
        <CardContent>
          <ol className="border-border space-y-3 border-l pl-4">
            {order.timeline.map((event, i) => (
              <li key={i} className="relative text-sm">
                <span className="bg-primary absolute -left-[1.3rem] top-1.5 size-2 rounded-full" aria-hidden />
                <p className="font-medium">{orderStatusLabel(event.to)}</p>
                <p className="text-muted-foreground text-xs">
                  {dateFmt.format(new Date(event.at))} · {event.actor}{event.note ? ` · ${event.note}` : ""}
                </p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
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
