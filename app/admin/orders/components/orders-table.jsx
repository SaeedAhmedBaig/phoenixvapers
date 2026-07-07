"use client";

import { Eye } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { formatMoney } from "../../lib/export-csv";

export const ORDER_STATUS_STYLES = {
  pending_payment: "bg-warning/10 text-warning",
  paid: "bg-primary/10 text-primary",
  dispatched: "bg-info/10 text-info",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-muted text-muted-foreground",
  refunded: "bg-destructive/10 text-destructive",
};

export function OrdersTable({ orders, onViewOrder }) {
  if (!orders.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">No orders match the current filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full min-w-[720px]">
        <thead className="border-b border-border bg-secondary/50">
          <tr className="text-left text-xs font-black uppercase text-muted-foreground">
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Items</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.orderNumber}
              className="cursor-pointer border-b border-border/50 transition hover:bg-secondary/30"
              onClick={() => onViewOrder(order)}
            >
              <td className="px-4 py-3">
                <span className="font-black text-foreground">#{order.orderNumber}</span>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString("en-GB")}
              </td>
              <td className="max-w-[200px] truncate px-4 py-3 text-sm font-bold text-foreground">
                {order.email}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{order.items?.length ?? 0}</td>
              <td className="px-4 py-3 font-bold text-foreground">{formatMoney(order.totalMinor)}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2.5 py-1 text-xs font-black capitalize ${
                    ORDER_STATUS_STYLES[order.status] || "bg-muted text-muted-foreground"
                  }`}
                >
                  {order.status?.replace("_", " ")}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewOrder(order);
                  }}
                  aria-label={`View order ${order.orderNumber}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
