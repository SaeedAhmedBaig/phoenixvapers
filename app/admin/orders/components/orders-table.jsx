"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Printer, Eye } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";

const STATUS_COLORS = {
  pending: "text-yellow-600 bg-yellow-50",
  processing: "text-blue-600 bg-blue-50",
  shipped: "text-purple-600 bg-purple-50",
  delivered: "text-green-600 bg-green-50",
  refunded: "text-red-600 bg-red-50",
  cancelled: "text-gray-600 bg-gray-50",
};

export function OrdersTable({ orders, sortBy, sortDir, onSort, onViewOrder }) {
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelected(selectAll ? [] : orders.map((o) => o._id));
  };

  const handleSelectOrder = (id) => {
    setSelected(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id],
    );
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span className="text-muted-foreground">⇅</span>;
    return sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const ColumnHeader = ({ label, field }) => (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 font-bold text-foreground hover:text-primary transition"
    >
      {label}
      <SortIcon field={field} />
    </button>
  );

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <table className="w-full">
        <thead className="border-b border-border bg-secondary/50">
          <tr>
            <th className="px-4 py-3 text-left">
              <Checkbox checked={selectAll} onChange={handleSelectAll} />
            </th>
            <th className="px-4 py-3 text-left">
              <ColumnHeader label="Order #" field="number" />
            </th>
            <th className="px-4 py-3 text-left">
              <ColumnHeader label="Date" field="createdAt" />
            </th>
            <th className="px-4 py-3 text-left">
              <ColumnHeader label="Customer" field="customerEmail" />
            </th>
            <th className="px-4 py-3 text-left">
              <ColumnHeader label="Items" field="itemCount" />
            </th>
            <th className="px-4 py-3 text-left">
              <ColumnHeader label="Total" field="totalMinor" />
            </th>
            <th className="px-4 py-3 text-left">
              <ColumnHeader label="Status" field="status" />
            </th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order._id}
              className="border-b border-border/50 hover:bg-secondary/30 transition"
            >
              <td className="px-4 py-3">
                <Checkbox
                  checked={selected.includes(order._id)}
                  onChange={() => handleSelectOrder(order._id)}
                />
              </td>
              <td className="px-4 py-3">
                <span className="font-black text-foreground">#{order.number}</span>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-sm font-bold text-foreground">
                {order.customerEmail}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {order.items?.length || 0}
              </td>
              <td className="px-4 py-3 font-bold text-foreground">
                £{((order.totalMinor || 0) / 100).toFixed(2)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-black ${
                    STATUS_COLORS[order.status] || "text-gray-600 bg-gray-50"
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewOrder(order)}
                    title="View order"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Print label"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {orders.length === 0 && (
        <div className="px-4 py-12 text-center">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      )}

      {selected.length > 0 && (
        <div className="border-t border-border bg-secondary/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">
              {selected.length} order{selected.length !== 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Change Status
              </Button>
              <Button variant="outline" size="sm">
                Print Labels
              </Button>
              <Button variant="destructive" size="sm">
                Refund Selected
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
