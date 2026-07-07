"use client";

import { BarChart3, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";

export function RevenueMetrics({ salesData, topProducts }) {
  if (!salesData) return null;

  const totalRevenue = salesData.reduce((sum, d) => sum + d.revenueMinor, 0) / 100;
  const totalOrders = salesData.reduce((sum, d) => sum + d.orders, 0);
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;
  const topProduct = topProducts?.[0];
  const topProductRevenue = topProduct ? (topProduct.revenueMinor / 100).toFixed(2) : 0;

  const metrics = [
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: `£${totalRevenue.toFixed(2)}`,
      trend: "Complete period",
    },
    {
      icon: ShoppingCart,
      label: "Total Orders",
      value: totalOrders.toString(),
      trend: "orders placed",
    },
    {
      icon: TrendingUp,
      label: "Avg Order Value",
      value: `£${avgOrderValue}`,
      trend: "per order",
    },
    {
      icon: BarChart3,
      label: "Top Product",
      value: topProduct?.name || "N/A",
      trend: `£${topProductRevenue} revenue`,
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div key={metric.label} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-muted-foreground">{metric.label}</p>
                <strong className="mt-2 block text-2xl font-black tracking-tight text-foreground">
                  {metric.value}
                </strong>
                <span className="mt-2 inline-flex text-xs font-bold text-success">{metric.trend}</span>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
