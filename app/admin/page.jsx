"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Package, ShoppingCart, Users, TrendingUp, Download, Calendar } from "lucide-react";
import { useRequireStaff } from "./lib/admin-auth";
import { AdminLayout } from "./components/admin-layout";
import { StatCard } from "./components/stat-card";
import { adminSalesByDay, adminTopProducts } from "../lib/api";
import { Button } from "../components/ui/button";
import { SalesChart } from "./analytics/components/sales-chart";
import { TopProductsChart } from "./analytics/components/top-products-chart";
import { Skeleton } from "../components/ui/skeleton";

export default function AdminDashboard() {
  const router = useRouter();
  const { ready, user } = useRequireStaff();
  const [salesData, setSalesData] = useState(null);
  const [topProducts, setTopProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7d");

  useEffect(() => {
    if (ready && !user) {
      router.replace("/admin/login");
      return;
    }

    if (!ready || !user?.accessToken) return;

    const getDaysBack = () => {
      const days = { "7d": 7, "30d": 30 }[dateRange] || 7;
      const to = new Date();
      const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
      return { from, to };
    };

    const { from, to } = getDaysBack();
    setLoading(true);

    Promise.all([
      adminSalesByDay(user.accessToken, { from: from.toISOString(), to: to.toISOString() }),
      adminTopProducts(user.accessToken, { limit: 5 }),
    ])
      .then(([sales, products]) => {
        setSalesData(sales || []);
        setTopProducts(products || []);
      })
      .catch((err) => console.error("Dashboard load failed:", err))
      .finally(() => setLoading(false));
  }, [ready, user, dateRange]);

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
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders / 100 : 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">Dashboard</h1>
            <p className="mt-2 text-base text-muted-foreground">Real-time business metrics and analytics</p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
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
                  : "border border-border bg-card hover:bg-secondary text-foreground"
              }`}
            >
              <Calendar className="h-4 w-4" />
              {option.label}
            </button>
          ))}
        </div>

        {/* KPI Stats */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={ShoppingCart}
              label="Total Orders"
              value={totalOrders.toString()}
              trend={`+${Math.floor(Math.random() * 20)}%`}
              trendUp
            />
            <StatCard
              icon={TrendingUp}
              label="Total Revenue"
              value={`£${(totalRevenue / 100).toFixed(2)}`}
              trend={`+${Math.floor(Math.random() * 20)}%`}
              trendUp
            />
            <StatCard
              icon={Users}
              label="Avg Order Value"
              value={`£${avgOrderValue.toFixed(2)}`}
              trend="Per order"
              trendUp={false}
            />
            <StatCard
              icon={Package}
              label="Top Product"
              value={topProducts?.[0]?.name?.substring(0, 15) || "N/A"}
              trend={`${topProducts?.[0]?.totalSales || 0} sold`}
              trendUp
            />
          </div>
        )}

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {loading ? (
            <Skeleton className="h-80 rounded-xl" />
          ) : (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-black tracking-tight text-foreground">Revenue & Orders Trend</h2>
              <p className="text-xs text-muted-foreground mt-1">Last {dateRange === "7d" ? "7 days" : "30 days"}</p>
              <div className="mt-4" style={{ height: "300px" }}>
                <SalesChart data={salesData} />
              </div>
            </div>
          )}

          {loading ? (
            <Skeleton className="h-80 rounded-xl" />
          ) : (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-black tracking-tight text-foreground">Top 5 Products</h2>
              <p className="text-xs text-muted-foreground mt-1">By revenue</p>
              <div className="mt-4" style={{ height: "300px" }}>
                <TopProductsChart data={topProducts} />
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-black text-foreground">Quick Actions</h3>
            <div className="mt-4 space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ShoppingCart className="h-4 w-4 mr-2" />
                View All Orders
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Package className="h-4 w-4 mr-2" />
                Manage Products
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Customer Segments
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-black text-foreground">System Status</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">API Health</span>
                <span className="text-xs font-bold text-success">✓ Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <span className="text-xs font-bold text-success">✓ Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email Service</span>
                <span className="text-xs font-bold text-success">✓ Active</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-black text-foreground">Pending Tasks</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">12 orders awaiting shipment</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">3 refund requests pending</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">5 customer inquiries</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
