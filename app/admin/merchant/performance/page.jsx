"use client";

import { useState } from "react";
import { useRequireStaff } from "../../lib/admin-auth";
import { AdminLayout } from "../../components/admin-layout";
import { BarChart3, TrendingUp, Users, Zap } from "lucide-react";

const PERFORMANCE_METRICS = [
  { label: "Total Sales", value: "£47,250", trend: "+18%", icon: BarChart3 },
  { label: "Conversion Rate", value: "3.8%", trend: "+0.6%", icon: TrendingUp },
  { label: "Customer Satisfaction", value: "4.7★", trend: "+0.2", icon: Users },
  { label: "Page Load Speed", value: "1.2s", trend: "-200ms", icon: Zap },
];

export default function MerchantPerformancePage() {
  const { ready } = useRequireStaff();
  const [period, setPeriod] = useState("30d");

  if (!ready) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Performance Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track your brand's sales and customer engagement metrics</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-3 flex-wrap">
          {[
            { label: "7 days", value: "7d" },
            { label: "30 days", value: "30d" },
            { label: "90 days", value: "90d" },
            { label: "1 year", value: "1y" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`rounded-lg px-4 py-2 text-sm font-black transition ${
                period === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card hover:bg-secondary text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PERFORMANCE_METRICS.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">{metric.label}</p>
                    <strong className="mt-2 block text-3xl font-black tracking-tight text-foreground">
                      {metric.value}
                    </strong>
                    <span className="mt-2 inline-flex text-sm font-bold text-success">{metric.trend}</span>
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sales Breakdown */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-black tracking-tight text-foreground">Top Products</h2>
            <div className="mt-4 space-y-3">
              <ProductRow rank="1" name="Signature 10ml" value="£4,240" pct="28%" />
              <ProductRow rank="2" name="Premium Bundle" value="£3,120" pct="21%" />
              <ProductRow rank="3" name="Starter Kit" value="£2,890" pct="19%" />
              <ProductRow rank="4" name="Bulk Pack" value="£2,140" pct="14%" />
              <ProductRow rank="5" name="Gift Set" value="£1,860" pct="12%" />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-black tracking-tight text-foreground">Geographic Performance</h2>
            <div className="mt-4 space-y-3">
              <GeoRow region="England" sales={8240} pct="55%" />
              <GeoRow region="Scotland" sales={3120} pct="21%" />
              <GeoRow region="Wales" sales={2140} pct="14%" />
              <GeoRow region="Northern Ireland" sales={1500} pct="10%" />
            </div>
          </section>
        </div>

        {/* Customer Insights */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-black tracking-tight text-foreground">Customer Insights</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <InsightBox label="New Customers" value="342" change="+24%" />
            <InsightBox label="Returning Customers" value="1,240" change="+8%" />
            <InsightBox label="Avg Customer Lifetime Value" value="£284" change="+12%" />
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

function ProductRow({ rank, name, value, pct }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-sm font-black">
          {rank}
        </span>
        <p className="text-sm font-bold text-foreground">{name}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{pct} of revenue</p>
      </div>
    </div>
  );
}

function GeoRow({ region, sales, pct }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
      <p className="text-sm font-bold text-foreground">{region}</p>
      <div className="text-right">
        <p className="text-sm font-bold text-foreground">£{sales.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">{pct}</p>
      </div>
    </div>
  );
}

function InsightBox({ label, value, change }) {
  return (
    <div className="rounded-lg border border-border/50 bg-secondary p-4">
      <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <strong className="mt-2 block text-2xl font-black text-foreground">{value}</strong>
      <p className="mt-1 text-xs font-bold text-success">{change}</p>
    </div>
  );
}
