import Link from "next/link";
import { formatPence } from "@phoenix/utils/money";

import { Badge } from "@/components/ui/badge";
import { operatorApi } from "@/lib/admin";
import { orderStatusClasses, orderStatusLabel } from "@/lib/orders";

export const metadata = { title: "Orders" };

const FILTERS = [
  ["", "All"],
  ["accepted", "Accepted"],
  ["compliance_confirmed", "Confirmed"],
  ["payment_authorised", "Authorised"],
  ["created", "Processing"],
  ["payment_failed", "Payment failed"],
  ["cancelled", "Cancelled"],
];

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
});

export default async function AdminOrdersPage({ searchParams }) {
  const sp = await searchParams;
  const status = typeof sp?.status === "string" ? sp.status : "";
  const q = typeof sp?.q === "string" ? sp.q : "";

  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  const qs = params.toString();
  const { items = [], counts = {}, total = 0 } = (await operatorApi(`/admin/orders${qs ? `?${qs}` : ""}`)) ?? {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-pine text-xs font-semibold tracking-widest uppercase">Operations</p>
          <h1 className="font-display mt-1 text-2xl font-medium sm:text-3xl">Orders</h1>
          <p className="text-muted-foreground mt-2 text-sm">{total} order{total === 1 ? "" : "s"} · newest first. Search by order number or email.</p>
        </div>
        <a
          href={`/admin/orders/export${qs ? `?${qs}` : ""}`}
          className="border-input hover:border-primary/50 flex h-9 items-center rounded-none border px-4 text-sm font-medium"
        >
          Export CSV
        </a>
      </div>

      <form method="get" className="flex gap-2">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <input
          name="q"
          defaultValue={q}
          placeholder="PHX-10001 or customer@email…"
          className="border-input bg-card h-9 w-full max-w-xs rounded-none border px-3 text-sm"
        />
        <button type="submit" className="bg-primary text-primary-foreground h-9 rounded-none px-4 text-sm font-medium">Search</button>
      </form>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(([key, label]) => {
          const active = status === key;
          const href = key ? `/admin/orders?status=${key}` : "/admin/orders";
          return (
            <Link
              key={key || "all"}
              href={href}
              className={`rounded-none border px-3 py-1.5 text-xs font-medium ${active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"}`}
            >
              {label}{key && counts[key] != null ? ` (${counts[key]})` : ""}
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="border-border bg-card border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">No orders{status ? " with this status" : ""} yet. Orders appear here as customers check out.</p>
        </div>
      ) : (
        <ul className="divide-border border-border divide-y border-y">
          {items.map((o) => (
            <li key={o.orderNumber}>
              <Link href={`/admin/orders/${o.orderNumber}`} className="hover:bg-muted/40 flex items-center justify-between gap-4 py-3 transition-colors">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-medium">{o.orderNumber}</p>
                  <p className="text-muted-foreground truncate text-xs">{o.email} · {dateFmt.format(new Date(o.placedAt))} · {o.itemCount} item{o.itemCount === 1 ? "" : "s"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`hidden border px-2 py-0.5 text-xs font-medium sm:inline-block ${orderStatusClasses(o.status)}`}>{orderStatusLabel(o.status)}</span>
                  <span className="text-sm font-semibold tabular-nums">{formatPence(o.totals.totalMinor)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
