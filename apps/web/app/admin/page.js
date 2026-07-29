import Link from "next/link";
import { formatPence } from "@phoenix/utils/money";
import { BarChart3, Boxes, Megaphone, Receipt, ShieldCheck, Truck, Users } from "lucide-react";

import { CatalogueStatusDonut } from "@/components/admin/charts/catalogue-status-donut";
import { DAY_LABELS, SalesHeatmap } from "@/components/admin/charts/sales-heatmap";
import { KpiCard } from "@/components/admin/kpi-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { operatorApi, requireOperator } from "@/lib/admin";

export const metadata = { title: "Dashboard" };

/** Fetch a count-bearing endpoint, tolerating a role that can't see it. */
async function safeCounts(path) {
  try {
    const data = await operatorApi(path);
    return data?.counts ?? {};
  } catch {
    return null; // role not permitted, or API down — the card hides.
  }
}

async function safeTotal(path) {
  try {
    const data = await operatorApi(path);
    return data?.total ?? 0;
  } catch {
    return null;
  }
}

/** Same fail-open convention as safeCounts/safeTotal — an API hiccup just
 *  hides the chart, it never crashes the dashboard. */
async function safeData(path) {
  try {
    return await operatorApi(path);
  } catch {
    return null;
  }
}

export default async function AdminDashboard() {
  const operator = await requireOperator();

  const role = operator.role;
  const canCatalogue = ["merchandiser", "compliance_officer", "platform_admin"].includes(role);
  const canVerification = ["compliance_officer", "platform_admin", "customer_support"].includes(role);
  const canStaff = role === "platform_admin";
  const canOrders = ["platform_admin", "customer_support", "finance"].includes(role);
  const canReports = ["finance", "platform_admin"].includes(role);
  const canFulfilment = ["fulfilment", "platform_admin"].includes(role);
  const canMarketing = ["marketing", "platform_admin"].includes(role);

  const [productCounts, avCounts, orderData, heatmapData] = await Promise.all([
    canCatalogue ? safeCounts("/admin/products?pageSize=1") : null,
    canVerification ? safeCounts("/admin/verification/customers?pageSize=1") : null,
    canOrders ? safeTotal("/admin/orders?pageSize=1") : null,
    canReports ? safeData("/admin/reports/sales-heatmap") : null,
  ]);

  const needsVerification = avCounts
    ? (avCounts.failed ?? 0) + (avCounts.inconclusive ?? 0) + (avCounts.locked ?? 0)
    : null;

  const peakCell =
    heatmapData?.cells?.length
      ? heatmapData.cells.reduce((a, b) => (b.orders > a.orders ? b : a))
      : null;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-pine text-xs font-semibold tracking-widest uppercase">Operations</p>
        <h1 className="font-display mt-1 text-2xl font-medium sm:text-3xl">Welcome, {operator.firstName}</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Everything here is real data entered through the console — create it, and it goes live on the storefront.
        </p>
      </div>

      {/* Headline numbers — the 3–5 key metrics that should read first,
          before any chart or quick link (§28 hierarchy principle). Every
          figure here is the same one the old inline description strings
          showed — just as its own card instead of buried in a sentence. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {canOrders && orderData != null ? <KpiCard label="Orders" value={orderData} /> : null}
        {canCatalogue && productCounts ? <KpiCard label="Sellable products" value={productCounts.sellable ?? 0} /> : null}
        {canCatalogue && productCounts ? <KpiCard label="In review" value={productCounts.review ?? 0} /> : null}
        {canVerification && needsVerification != null ? <KpiCard label="Needs verification" value={needsVerification} /> : null}
      </div>

      {(canReports && heatmapData) || (canCatalogue && productCounts) ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {canReports && heatmapData ? (
            <Card className="rounded-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">When orders come in</CardTitle>
                <CardDescription>
                  {peakCell && peakCell.orders > 0
                    ? `Peak: ${DAY_LABELS[peakCell.dow]} ${String(peakCell.hour).padStart(2, "0")}:00 — ${peakCell.orders} order${peakCell.orders === 1 ? "" : "s"} (${formatPence(peakCell.revenueMinor)})`
                    : "No orders yet in this range."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SalesHeatmap cells={heatmapData.cells} maxOrders={heatmapData.maxOrders} />
              </CardContent>
            </Card>
          ) : null}

          {canCatalogue && productCounts ? (
            <Card className="rounded-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Catalogue status</CardTitle>
                <CardDescription>Click a slice to jump to that filter.</CardDescription>
              </CardHeader>
              <CardContent>
                <CatalogueStatusDonut counts={productCounts} />
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}

      {/* Quick links — same SectionCard, same role gates as before, just
          demoted below the headline numbers and charts. */}
      <div>
        <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-widest uppercase">Quick links</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {canOrders && orderData != null ? (
            <SectionCard
              href="/admin/orders"
              icon={Receipt}
              title="Orders"
              desc={`${orderData} order${orderData === 1 ? "" : "s"} · search, triage, audit trail`}
            />
          ) : null}
          {canCatalogue && productCounts ? (
            <SectionCard
              href="/admin/products"
              icon={Boxes}
              title="Catalogue"
              desc={`${productCounts.sellable ?? 0} live · ${productCounts.review ?? 0} in review · ${productCounts.draft ?? 0} draft`}
            />
          ) : null}
          {canVerification && avCounts ? (
            <SectionCard
              href="/admin/customers"
              icon={ShieldCheck}
              title="Verification queue"
              desc={`${avCounts.passed ?? 0} verified · ${needsVerification ?? 0} need attention`}
            />
          ) : null}
          {canReports ? (
            <SectionCard href="/admin/reports" icon={BarChart3} title="Reports" desc="Sales, duty & VAT — realised revenue and the order funnel." />
          ) : null}
          {canFulfilment ? (
            <SectionCard href="/admin/fulfilment" icon={Truck} title="Fulfilment" desc="Pick, pack, dispatch & inventory — arrives with Phase 4." />
          ) : null}
          {canMarketing ? (
            <SectionCard href="/admin/marketing" icon={Megaphone} title="Marketing" desc="Promotions, content & newsletter — arrives with Phase 8." />
          ) : null}
          {canStaff ? (
            <SectionCard
              href="/admin/staff"
              icon={Users}
              title="Staff accounts"
              desc="Create and manage operator logins and roles."
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ href, icon: Icon, title, desc }) {
  return (
    <Link href={href}>
      <Card className="hover:border-primary/50 h-full rounded-none shadow-sm transition-colors">
        <CardHeader>
          <Icon className="text-pine size-5" />
          <CardTitle className="font-display mt-2 text-lg font-medium">{title}</CardTitle>
          <CardDescription>{desc}</CardDescription>
        </CardHeader>
        <CardContent>
          <span className="text-pine text-sm font-medium">Open →</span>
        </CardContent>
      </Card>
    </Link>
  );
}
