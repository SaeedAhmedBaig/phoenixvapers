import Link from "next/link";
import { BarChart3, Boxes, Megaphone, Receipt, ShieldCheck, Truck, Users } from "lucide-react";

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

export default async function AdminDashboard() {
  const operator = await requireOperator();

  const role = operator.role;
  const canCatalogue = ["merchandiser", "compliance_officer"].includes(role);
  const canVerification = ["compliance_officer", "platform_admin", "customer_support"].includes(role);
  const canStaff = role === "platform_admin";
  const canOrders = ["platform_admin", "customer_support", "finance"].includes(role);
  const canReports = ["finance", "platform_admin"].includes(role);
  const canFulfilment = ["fulfilment", "platform_admin"].includes(role);
  const canMarketing = ["marketing", "platform_admin"].includes(role);

  const [productCounts, avCounts, orderData] = await Promise.all([
    canCatalogue ? safeCounts("/admin/products?pageSize=1") : null,
    canVerification ? safeCounts("/admin/verification/customers?pageSize=1") : null,
    canOrders ? safeTotal("/admin/orders?pageSize=1") : null,
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-pine text-xs font-semibold tracking-widest uppercase">Operations</p>
        <h1 className="font-display mt-1 text-2xl font-medium sm:text-3xl">Welcome, {operator.firstName}</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Everything here is real data entered through the console — create it, and it goes live on the storefront.
        </p>
      </div>

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
            desc={`${avCounts.passed ?? 0} verified · ${(avCounts.failed ?? 0) + (avCounts.inconclusive ?? 0) + (avCounts.locked ?? 0)} need attention`}
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
