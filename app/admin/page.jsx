"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Package, ShoppingCart, Users } from "lucide-react";
import { useRequireStaff } from "./lib/admin-auth";
import { AdminLayout } from "./components/admin-layout";
import { StatCard } from "./components/stat-card";

export default function AdminDashboard() {
  const router = useRouter();
  const { ready, isStaff } = useRequireStaff();

  useEffect(() => {
    if (ready && !isStaff) {
      router.replace("/admin/login");
    }
  }, [ready, isStaff, router]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm font-bold text-muted-foreground">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-2 text-base text-muted-foreground">Welcome back. Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={ShoppingCart}
            label="Orders Today"
            value="124"
            trend="+12%"
            trendUp
          />
          <StatCard
            icon={Users}
            label="New Customers"
            value="42"
            trend="+8%"
            trendUp
          />
          <StatCard
            icon={Package}
            label="Products"
            value="847"
            trend="2 new"
            trendUp
          />
          <StatCard
            icon={BarChart3}
            label="Revenue"
            value="£5,240"
            trend="+15%"
            trendUp
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-black tracking-tight text-foreground">Recent Orders</h2>
            <div className="mt-4 space-y-3">
              <OrderRow
                orderId="ORD-2024-5847"
                customer="Sarah Mitchell"
                items={3}
                amount="£89.99"
                status="Delivered"
              />
              <OrderRow
                orderId="ORD-2024-5846"
                customer="James Powell"
                items={2}
                amount="£64.50"
                status="Shipped"
              />
              <OrderRow
                orderId="ORD-2024-5845"
                customer="Emma Davis"
                items={1}
                amount="£42.00"
                status="Processing"
              />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-black tracking-tight text-foreground">Top Products</h2>
            <div className="mt-4 space-y-3">
              <ProductRow rank="1" name="Bar Wars 10ml" sales={284} revenue="£2,840" />
              <ProductRow rank="2" name="FiftyFifty Smooth" sales={156} revenue="£1,560" />
              <ProductRow rank="3" name="Nic Salt Range" sales={142} revenue="£1,420" />
            </div>
          </section>
        </div>
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

function OrderRow({ orderId, customer, items, amount, status }) {
  const statusColor = {
    Delivered: "text-success",
    Shipped: "text-primary",
    Processing: "text-warning",
  }[status];

  return (
    <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
      <div>
        <p className="text-sm font-black text-foreground">{orderId}</p>
        <p className="text-xs text-muted-foreground">{customer}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-foreground">{amount}</p>
        <p className={`text-xs font-bold ${statusColor}`}>{status}</p>
      </div>
    </div>
  );
}

function ProductRow({ rank, name, sales, revenue }) {
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
