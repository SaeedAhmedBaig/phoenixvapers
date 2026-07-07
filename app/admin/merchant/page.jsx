"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { useRequireStaff } from "../lib/admin-auth";
import { AdminLayout } from "../components/admin-layout";

export default function MerchantDashboard() {
  const router = useRouter();
  const { ready, user, isStaff } = useRequireStaff();

  useEffect(() => {
    if (ready && (!isStaff || user?.role !== "brand-partner")) {
      router.replace("/admin/login");
    }
  }, [ready, isStaff, user, router]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm font-bold text-muted-foreground">Loading merchant dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Merchant Dashboard</h1>
          <p className="mt-2 text-base text-muted-foreground">Manage your brand presence and performance</p>
        </div>

        {/* Brand Stats */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={ShoppingCart}
            label="Brand Orders"
            value="284"
            trend="+18%"
            trendUp
          />
          <StatCard
            icon={Package}
            label="Active Products"
            value="52"
            trend="3 new this month"
            trendUp
          />
          <StatCard
            icon={TrendingUp}
            label="Revenue"
            value="£12,480"
            trend="+24%"
            trendUp
          />
          <StatCard
            icon={BarChart3}
            label="Avg Rating"
            value="4.8★"
            trend="Based on 127 reviews"
            trendUp
          />
        </div>

        {/* Quick Overview */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-black tracking-tight text-foreground">Product Performance</h2>
            <div className="mt-4 space-y-3">
              <ProductPerfRow rank="1" name="Signature Range 10ml" sales={156} revenue="£2,340" />
              <ProductPerfRow rank="2" name="Premium Bundle Pack" sales={89} revenue="£1,780" />
              <ProductPerfRow rank="3" name="Starter Kit" sales={65} revenue="£1,300" />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-black tracking-tight text-foreground">Recent Orders</h2>
            <div className="mt-4 space-y-3">
              <OrderRow orderId="ORD-2024-5847" amount="£156.00" status="Shipped" />
              <OrderRow orderId="ORD-2024-5846" amount="£89.50" status="Processing" />
              <OrderRow orderId="ORD-2024-5845" amount="£245.00" status="Delivered" />
            </div>
          </section>
        </div>

        {/* Marketing Insights */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-black tracking-tight text-foreground">Marketing Insights</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <InsightCard
              label="Click-through Rate"
              value="4.2%"
              change="+0.8%"
            />
            <InsightCard
              label="Customer Retention"
              value="68%"
              change="+5%"
            />
            <InsightCard
              label="Product Views"
              value="12,480"
              change="+28%"
            />
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

function StatCard({ icon: Icon, label, value, trend, trendUp }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-muted-foreground">{label}</p>
          <strong className="mt-2 block text-3xl font-black tracking-tight text-foreground">{value}</strong>
          <span className={`mt-2 inline-flex text-sm font-bold ${trendUp ? "text-success" : "text-destructive"}`}>
            {trend}
          </span>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}

function ProductPerfRow({ rank, name, sales, revenue }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-sm font-black text-foreground">
          {rank}
        </span>
        <p className="text-sm font-bold text-foreground">{name}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-foreground">{sales} sales</p>
        <p className="text-xs text-muted-foreground">{revenue}</p>
      </div>
    </div>
  );
}

function OrderRow({ orderId, amount, status }) {
  const statusColor = {
    Delivered: "text-success",
    Shipped: "text-primary",
    Processing: "text-warning",
  }[status];

  return (
    <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
      <p className="text-sm font-black text-foreground">{orderId}</p>
      <div className="text-right">
        <p className="text-sm font-bold text-foreground">{amount}</p>
        <p className={`text-xs font-bold ${statusColor}`}>{status}</p>
      </div>
    </div>
  );
}

function InsightCard({ label, value, change }) {
  return (
    <div className="rounded-lg border border-border/50 bg-secondary p-4">
      <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <strong className="mt-2 block text-2xl font-black text-foreground">{value}</strong>
      <p className="mt-1 text-xs font-bold text-success">{change}</p>
    </div>
  );
}
