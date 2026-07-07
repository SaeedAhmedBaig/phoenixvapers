"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, Users, Package, Download } from "lucide-react";
import { useRequireStaff } from "../../lib/admin-auth";
import { AdminLayout } from "../../components/admin-layout";
import { Button } from "../../../components/ui/button";

const REPORT_TYPES = [
  {
    name: "Revenue Report",
    icon: BarChart3,
    description: "Daily, weekly, and monthly revenue analysis",
    lastGenerated: "Today at 10:30 AM",
  },
  {
    name: "Sales Trends",
    icon: TrendingUp,
    description: "Product performance and seasonal trends",
    lastGenerated: "Yesterday at 11:00 PM",
  },
  {
    name: "Customer Analytics",
    icon: Users,
    description: "Customer acquisition and retention metrics",
    lastGenerated: "2024-01-12",
  },
  {
    name: "Inventory Report",
    icon: Package,
    description: "Stock levels and reorder recommendations",
    lastGenerated: "Today at 3:00 AM",
  },
];

export default function SuperAdminReportsPage() {
  const { ready } = useRequireStaff();
  const [dateRange, setDateRange] = useState("30d");

  if (!ready) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Generate and download system reports</p>
        </div>

        {/* Date Range Filter */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-black tracking-tight text-foreground">Report Period</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { label: "Last 7 days", value: "7d" },
              { label: "Last 30 days", value: "30d" },
              { label: "Last 90 days", value: "90d" },
              { label: "This year", value: "1y" },
              { label: "Custom range", value: "custom" },
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
        </div>

        {/* Reports */}
        <div className="grid gap-6 md:grid-cols-2">
          {REPORT_TYPES.map((report) => {
            const Icon = report.icon;
            return (
              <div key={report.name} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-black tracking-tight text-foreground">{report.name}</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{report.description}</p>
                    <p className="mt-3 text-xs text-muted-foreground">Last generated: {report.lastGenerated}</p>
                  </div>
                </div>

                <Button className="mt-6 w-full" variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              </div>
            );
          })}
        </div>

        {/* Key Metrics */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-black tracking-tight text-foreground">System Metrics</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Total Revenue" value="£47,250" change="+12%" />
            <MetricCard label="Total Orders" value="1,284" change="+8%" />
            <MetricCard label="Avg Order Value" value="£36.80" change="+2%" />
            <MetricCard label="Conversion Rate" value="3.2%" change="-0.5%" />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function MetricCard({ label, value, change }) {
  return (
    <div className="rounded-lg border border-border/50 bg-secondary p-4">
      <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <strong className="mt-2 block text-2xl font-black text-foreground">{value}</strong>
      <p className="mt-1 text-xs font-bold text-success">{change}</p>
    </div>
  );
}
