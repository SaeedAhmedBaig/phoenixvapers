"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Download,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRequireStaff } from "./lib/admin-auth";
import { AdminLayout } from "./components/admin-layout";
import { StatCard } from "./components/stat-card";
import { adminListOrders, adminSalesByDay, adminTopProducts } from "../lib/api";
import { Button } from "../components/ui/button";
import { SalesChart } from "./analytics/components/sales-chart";
import { TopProductsChart } from "./analytics/components/top-products-chart";
import { Skeleton } from "../components/ui/skeleton";
import { exportToCsv, formatMoney } from "./lib/export-csv";

const STATUS_STYLES = {
  pending_payment: "bg-warning/10 text-warning",
  paid: "bg-primary/10 text-primary",
  dispatched: "bg-info/10 text-info",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-muted text-muted-foreground",
  refunded: "bg-destructive/10 text-destructive",
};

export default function AdminDashboard() {
  const { ready, accessToken } = useRequireStaff();
  const [salesData, setSalesData] = useState(null);
  const [topProducts, setTopProducts] = useState(null);
  const [recentOrders, setRecentOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("7d");

  useEffect(() => {
    if (!ready || !accessToken) return;

    const days = { "7d": 7, "30d": 30 }[dateRange] || 7;
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

    setLoading(true);
    setError(null);

    Promise.all([
      adminSalesByDay(accessToken, { from: from.toISOString(), to: to.toISOString() }),
      adminTopProducts(accessToken, { limit: 5 }),
      adminListOrders(accessToken, { page: 1, limit: 6 }),
    ])
      .then(([sales, products, orders]) => {
        setSalesData(Array.isArray(sales) ? sales : []);
        setTopProducts(Array.isArray(products) ? products : []);
        setRecentOrders(orders?.items ?? []);
      })
      .catch((err) => {
        console.error("Dashboard load failed:", err);
        setError("Could not load dashboard data. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [ready, accessToken, dateRange]);

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

  const totalRevenue = salesData?.reduce((sum, d) => sum + (d.revenueMinor || 0), 0) || 0;
  const totalOrders = salesData?.reduce((sum, d) => sum + (d.orders || 0), 0) || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  function handleExport() {
    const exported = exportToCsv(`sales-summary-${dateRange}`, salesData || [], {
      Date: "_id",
      "Revenue (£)": (d) => ((d.revenueMinor || 0) / 100).toFixed(2),
      Orders: "orders",
    });
    if (!exported) setError("Nothing to export for this period yet.");
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">Dashboard</h1>
            <p className="mt-2 text-base text-muted-foreground">
              Business performance at a glance
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={loading || !salesData?.length}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2">
          {[
            { label: "Last 7 days", value: "7d" },
            { label: "Last 30 days", value: "30d" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setDateRange(option.value)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${
                dateRange === option.value
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:bg-secondary"
              }`}
            >
              <Calendar className="h-4 w-4" />
              {option.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">
            {error}
          </div>
        )}

        {/* KPI Stats */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={ShoppingCart}
              label="Orders"
              value={totalOrders.toLocaleString()}
              trend={dateRange === "7d" ? "Last 7 days" : "Last 30 days"}
              trendUp
            />
            <StatCard
              icon={TrendingUp}
              label="Revenue"
              value={formatMoney(totalRevenue)}
              trend={dateRange === "7d" ? "Last 7 days" : "Last 30 days"}
              trendUp
            />
            <StatCard
              icon={Users}
              label="Avg Order Value"
              value={formatMoney(avgOrderValue)}
              trend="Per order"
              trendUp
            />
            <StatCard
              icon={Package}
              label="Top Product"
              value={topProducts?.[0]?.name?.slice(0, 18) || "—"}
              trend={topProducts?.[0] ? `${topProducts[0].unitsSold ?? topProducts[0].qty ?? 0} sold` : "No sales yet"}
              trendUp
            />
          </div>
        )}

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {loading ? (
            <Skeleton className="h-96 rounded-xl" />
          ) : (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-black tracking-tight text-foreground">Revenue & Orders</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {dateRange === "7d" ? "Last 7 days" : "Last 30 days"}
              </p>
              <div className="mt-4 h-80">
                <SalesChart data={salesData} />
              </div>
            </div>
          )}

          {loading ? (
            <Skeleton className="h-96 rounded-xl" />
          ) : (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-black tracking-tight text-foreground">Top Products</h2>
              <p className="mt-1 text-xs text-muted-foreground">By revenue</p>
              <div className="mt-4 h-80">
                <TopProductsChart data={topProducts} />
              </div>
            </div>
          )}
        </div>

        {/* Recent Orders + Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight text-foreground">Recent Orders</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/orders">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {loading ? (
                [1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)
              ) : recentOrders?.length ? (
                recentOrders.map((order) => (
                  <div
                    key={order.orderNumber}
                    className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-black text-foreground">#{order.orderNumber}</p>
                      <p className="truncate text-xs text-muted-foreground">{order.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-foreground">
                        {formatMoney(order.totalMinor)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-black capitalize ${
                          STATUS_STYLES[order.status] || "bg-muted text-muted-foreground"
                        }`}
                      >
                        {order.status?.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">No orders yet</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-black tracking-tight text-foreground">Quick Actions</h2>
            <div className="mt-4 space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/admin/orders">
                  <ShoppingCart className="h-4 w-4" />
                  Manage Orders
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/admin/products">
                  <Package className="h-4 w-4" />
                  Manage Products
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/admin/customers">
                  <Users className="h-4 w-4" />
                  View Customers
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/admin/analytics">
                  <TrendingUp className="h-4 w-4" />
                  Full Analytics
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
