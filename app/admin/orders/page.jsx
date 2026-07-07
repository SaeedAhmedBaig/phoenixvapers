"use client";

import { useState, useEffect } from "react";
import { useRequireStaff } from "../lib/admin-auth";
import { AdminLayout } from "../components/admin-layout";
import { Permissions } from "../decorators/permissions";
import { OrdersTable } from "./components/orders-table";
import { OrderDetailModal } from "./components/order-detail-modal";
import { OrderFilters } from "./components/order-filters";
import { Button } from "../../components/ui/button";
import { Download, Plus, Filter } from "lucide-react";
import { adminGetOrders } from "../../lib/api";
import { Skeleton } from "../../components/ui/skeleton";

@Permissions("orders.view")
export default function OrdersPage() {
  const { ready, user } = useRequireStaff();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    dateFrom: "",
    dateTo: "",
    searchQuery: "",
    minAmount: "",
    maxAmount: "",
  });

  // Sorting
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    if (!ready || !user?.accessToken) return;

    const loadOrders = async () => {
      setLoading(true);
      try {
        const response = await adminGetOrders(user.accessToken, {
          page,
          pageSize,
          ...filters,
          sortBy,
          sortDir,
        });

        setOrders(response.data || []);
        setTotal(response.total || 0);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [ready, user, page, pageSize, filters, sortBy, sortDir]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleExportOrders = async () => {
    // Export logic - calls /api/admin/orders/export
    const params = new URLSearchParams({
      ...filters,
      format: "csv",
    });
    window.location.href = `/api/admin/orders/export?${params}`;
  };

  if (!ready) return null;

  const totalPages = Math.ceil(total / pageSize);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-foreground">Orders</h1>
            <p className="mt-2 text-muted-foreground">Manage and track all customer orders</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportOrders}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-border bg-card p-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 font-bold text-foreground"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Hide" : "Show"} Filters
          </button>

          {showFilters && (
            <OrderFilters
              filters={filters}
              onChange={setFilters}
              onClear={() =>
                setFilters({
                  status: "",
                  dateFrom: "",
                  dateTo: "",
                  searchQuery: "",
                  minAmount: "",
                  maxAmount: "",
                })
              }
            />
          )}
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <OrdersTable
              orders={orders}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={(field) => {
                if (sortBy === field) {
                  setSortDir(sortDir === "asc" ? "desc" : "asc");
                } else {
                  setSortBy(field);
                  setSortDir("desc");
                }
              }}
              onViewOrder={handleViewOrder}
            />

            {/* Pagination */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} orders
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded border border-border bg-card px-3 py-1 text-sm"
                >
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>

                <span className="text-sm font-bold">
                  Page {page} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </AdminLayout>
  );
}
