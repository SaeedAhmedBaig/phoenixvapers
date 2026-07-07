"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { useRequireStaff } from "../lib/admin-auth";
import { AdminLayout } from "../components/admin-layout";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { adminListOrders } from "../../lib/api";
import { exportToCsv } from "../lib/export-csv";
import { OrdersTable } from "./components/orders-table";
import { OrderDetailModal } from "./components/order-detail-modal";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Pending Payment", value: "pending_payment" },
  { label: "Paid", value: "paid" },
  { label: "Dispatched", value: "dispatched" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
];

export default function OrdersPage() {
  const { ready, accessToken } = useRequireStaff();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const loadOrders = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await adminListOrders(accessToken, {
        page,
        limit,
        ...(status ? { status } : {}),
      });
      setOrders(res?.items ?? []);
      setTotal(res?.total ?? 0);
      setPages(res?.pages ?? 1);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError("Could not load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, limit, status]);

  useEffect(() => {
    if (ready) loadOrders();
  }, [ready, loadOrders]);

  // Search filters the current page client-side (order number / email)
  const visibleOrders = search
    ? orders.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
          o.email?.toLowerCase().includes(search.toLowerCase()),
      )
    : orders;

  function handleExport() {
    exportToCsv("orders", visibleOrders, {
      "Order #": "orderNumber",
      Date: (o) => new Date(o.createdAt).toLocaleDateString("en-GB"),
      Customer: "email",
      Items: (o) => o.items?.length ?? 0,
      "Total (£)": (o) => ((o.totalMinor || 0) / 100).toFixed(2),
      Status: "status",
      Tracking: (o) => o.trackingNumber || "",
    });
  }

  if (!ready) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">Orders</h1>
            <p className="mt-2 text-muted-foreground">
              {total} order{total !== 1 ? "s" : ""} in total
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadOrders} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={!visibleOrders.length}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Status filter + search */}
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setStatus(f.value);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-black transition ${
                  status === f.value
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-foreground hover:bg-secondary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search this page by order number or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-bold placeholder-muted-foreground outline-none focus:border-primary"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">
            {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <OrdersTable orders={visibleOrders} onViewOrder={setSelectedOrder} />

            {/* Pagination */}
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {pages} — {total} orders
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-bold"
                >
                  <option value="25">25 / page</option>
                  <option value="50">50 / page</option>
                  <option value="100">100 / page</option>
                </select>
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail modal — supports status + tracking updates */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          accessToken={accessToken}
          onClose={() => setSelectedOrder(null)}
          onUpdated={() => {
            setSelectedOrder(null);
            loadOrders();
          }}
        />
      )}
    </AdminLayout>
  );
}
