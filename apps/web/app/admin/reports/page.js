import { formatPence } from "@phoenix/utils/money";

import { OrderFunnel } from "@/components/admin/charts/order-funnel";
import { RevenueDonut } from "@/components/admin/charts/revenue-donut";
import { KpiCard } from "@/components/admin/kpi-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { operatorApi } from "@/lib/admin";
import { orderStatusLabel } from "@/lib/orders";

// Failure states get the destructive tone in the funnel so they stand out.
const FUNNEL_STATES = [
  { key: "created", tone: "default" },
  { key: "payment_authorised", tone: "default" },
  { key: "compliance_confirmed", tone: "default" },
  { key: "accepted", tone: "default" },
  { key: "payment_failed", tone: "bad" },
  { key: "cancelled", tone: "bad" },
];

export const metadata = { title: "Reports" };

export default async function ReportsPage({ searchParams }) {
  const sp = await searchParams;
  const from = typeof sp?.from === "string" ? sp.from : "";
  const to = typeof sp?.to === "string" ? sp.to : "";

  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  const data = (await operatorApi(`/admin/reports/sales${qs ? `?${qs}` : ""}`)) ?? {};
  const r = data.realised ?? { orders: 0, netMinor: 0, dutyMinor: 0, vatMinor: 0, totalMinor: 0 };
  const statusCounts = data.statusCounts ?? {};

  return (
    <div className="space-y-8">
      <div>
        <p className="text-pine text-xs font-semibold tracking-widest uppercase">Finance</p>
        <h1 className="font-display mt-1 text-2xl font-medium sm:text-3xl">Sales & duty report</h1>
        <p className="text-muted-foreground mt-2 text-sm">Realised revenue (accepted orders) with the itemised duty and VAT split.</p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="from" className="text-muted-foreground text-xs">From</label>
          <input id="from" type="date" name="from" defaultValue={from} className="border-input bg-card h-9 rounded-none border px-3 text-sm" />
        </div>
        <div className="space-y-1">
          <label htmlFor="to" className="text-muted-foreground text-xs">To</label>
          <input id="to" type="date" name="to" defaultValue={to} className="border-input bg-card h-9 rounded-none border px-3 text-sm" />
        </div>
        <button type="submit" className="bg-primary text-primary-foreground h-9 rounded-none px-4 text-sm font-medium">Apply</button>
        <a
          href={`/admin/reports/sales/pdf${qs ? `?${qs}` : ""}`}
          target="_blank"
          rel="noopener"
          className="border-input hover:border-primary/50 flex h-9 items-center rounded-none border px-4 text-sm font-medium"
        >
          Download PDF
        </a>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Accepted orders" value={r.orders} />
        <KpiCard label="Net revenue" value={formatPence(r.netMinor)} />
        <KpiCard label="Vaping duty" value={formatPence(r.dutyMinor)} />
        <KpiCard label="VAT" value={formatPence(r.vatMinor)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Revenue composition</CardTitle>
            <CardDescription>How gross taken splits into net, duty and VAT{from || to ? " in range" : ""}.</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueDonut netMinor={r.netMinor} dutyMinor={r.dutyMinor} vatMinor={r.vatMinor} />
          </CardContent>
        </Card>

        <Card className="rounded-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Order funnel</CardTitle>
            <CardDescription>Orders at each lifecycle state — failures highlighted.</CardDescription>
          </CardHeader>
          <CardContent>
            <OrderFunnel
              data={FUNNEL_STATES.map((s) => ({
                label: orderStatusLabel(s.key),
                count: statusCounts[s.key] ?? 0,
                tone: s.tone,
              }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
