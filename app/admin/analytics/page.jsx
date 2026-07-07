"use client";

import { useEffect, useState } from "react";
import { Clock, Filter, PieChart } from "lucide-react";
import { useRequireStaff } from "../lib/admin-auth";
import { AdminLayout } from "../components/admin-layout";
import { adminSalesByDay, adminTopProducts } from "../../lib/api";
import { SalesChart } from "./components/sales-chart";
import { TopProductsChart } from "./components/top-products-chart";
import { RevenueMetrics } from "./components/revenue-metrics";
import { Skeleton } from "../../components/ui/skeleton";

export default function AnalyticsDashboard() {
  const { ready, accessToken } = useRequireStaff();
  const [salesData, setSalesData] = useState(null);
  const [topProducts, setTopProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d");

  useEffect(() => {
    if (!accessToken) return;

    const getDaysBack = () => {
      const days =
        {
          "7d": 7,
          "30d": 30,
          "90d": 90,
          "1y": 365,
        }[dateRange] || 30;

      const to = new Date();
      const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

      return { from, to };
    };

    const { from, to } = getDaysBack();

    setLoading(true);

    Promise.all([
      adminSalesByDay(accessToken, {
        from: from.toISOString(),
        to: to.toISOString(),
      }),
      adminTopProducts(accessToken, { limit: 10 }),
    ])
      .then(([sales, products]) => {
        setSalesData(sales);
        setTopProducts(products);
      })
      .catch((err) => console.error("Analytics load failed:", err))
      .finally(() => setLoading(false));
  }, [ready, accessToken, dateRange]);

  if (!ready) return null;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Real-time sales, revenue, and product performance data
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "7 days", value: "7d" },
            { label: "30 days", value: "30d" },
            { label: "90 days", value: "90d" },
            { label: "1 year", value: "1y" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setDateRange(option.value)}
              className={`rounded-lg px-4 py-2 text-sm font-black transition ${
                dateRange === option.value
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card hover:bg-secondary text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <RevenueMetrics
            salesData={salesData}
            topProducts={topProducts}
          />
        )}

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sales & Revenue Chart */}
          {loading ? (
            <Skeleton className="h-80 rounded-xl" />
          ) : (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-black tracking-tight text-foreground">
                Revenue Trend
              </h2>
              <div className="mt-4">
                <SalesChart data={salesData} />
              </div>
            </div>
          )}

          {/* Top Products */}
          {loading ? (
            <Skeleton className="h-80 rounded-xl" />
          ) : (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-black tracking-tight text-foreground">
                Top Products
              </h2>
              <div className="mt-4">
                <TopProductsChart data={topProducts} />
              </div>
            </div>
          )}
        </div>

        {/* Upcoming analytics modules */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              <h3 className="text-base font-black text-foreground">
                Customer Segmentation
              </h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              New, returning, and VIP breakdown — coming soon
            </p>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <h3 className="text-base font-black text-foreground">
                Conversion Funnel
              </h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Browse, basket, checkout, and payment tracking — coming soon
            </p>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-base font-black text-foreground">
                Order Timing
              </h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Orders by day and hour patterns — coming soon
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}