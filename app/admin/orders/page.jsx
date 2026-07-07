"use client";

import { useState } from "react";
import { ChevronRight, Eye, Loader2, Search } from "lucide-react";
import { useRequireStaff } from "../lib/admin-auth";
import { AdminLayout } from "../components/admin-layout";
import { Button } from "../../components/ui/button";

const MOCK_ORDERS = [
  { id: "ORD-2024-5847", customer: "Sarah Mitchell", items: 3, total: "£89.99", status: "Delivered", date: "2024-01-15" },
  { id: "ORD-2024-5846", customer: "James Powell", items: 2, total: "£64.50", status: "Shipped", date: "2024-01-14" },
  { id: "ORD-2024-5845", customer: "Emma Davis", items: 1, total: "£42.00", status: "Processing", date: "2024-01-14" },
  { id: "ORD-2024-5844", customer: "Michael Chen", items: 4, total: "£156.75", status: "Pending", date: "2024-01-13" },
  { id: "ORD-2024-5843", customer: "Jessica Brown", items: 2, total: "£78.99", status: "Delivered", date: "2024-01-13" },
];

export default function OrdersPage() {
  const { ready } = useRequireStaff();
  const [search, setSearch] = useState("");

  if (!ready) return null;

  const filtered = MOCK_ORDERS.filter(
    (order) =>
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Orders</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage all customer orders and shipments</p>
          </div>
          <Button>Create Order</Button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by order ID or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm font-bold placeholder-muted-foreground outline-none"
          />
        </div>

        {/* Orders Table */}
        <div className="rounded-xl border border-border overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-muted-foreground">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-muted-foreground">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-muted-foreground">Items</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-muted-foreground">Total</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase text-muted-foreground">Date</th>
                <th className="relative px-6 py-3"><span className="sr-only">View</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-secondary/50 transition">
                  <td className="px-6 py-4">
                    <strong className="text-sm font-black text-foreground">{order.id}</strong>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-foreground">{order.customer}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-muted-foreground">{order.items} items</span>
                  </td>
                  <td className="px-6 py-4">
                    <strong className="text-sm font-black text-foreground">{order.total}</strong>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{order.date}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No orders found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function StatusBadge({ status }) {
  const colors = {
    Delivered: "bg-success/10 text-success",
    Shipped: "bg-primary/10 text-primary",
    Processing: "bg-warning/10 text-warning",
    Pending: "bg-muted text-muted-foreground",
  };

  return (
    <span className={`inline-flex rounded-lg px-3 py-1 text-xs font-black ${colors[status] || colors.Pending}`}>
      {status}
    </span>
  );
}
