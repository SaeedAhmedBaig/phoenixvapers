"use client";

import { useState } from "react";
import { Loader2, MapPin, Package, Truck, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { adminUpdateOrderStatus } from "../../../lib/api";
import { formatMoney } from "../../lib/export-csv";
import { ORDER_STATUS_STYLES } from "./orders-table";

const STATUS_OPTIONS = [
  { label: "Pending Payment", value: "pending_payment" },
  { label: "Paid", value: "paid" },
  { label: "Dispatched", value: "dispatched" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
];

export function OrderDetailModal({ order, accessToken, onClose, onUpdated }) {
  const [status, setStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const hasChanges = status !== order.status || trackingNumber !== (order.trackingNumber || "");

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await adminUpdateOrderStatus(
        order.orderNumber,
        { status, ...(trackingNumber ? { trackingNumber } : {}) },
        accessToken,
      );
      onUpdated();
    } catch (err) {
      console.error("Order update failed:", err);
      setError(err?.message || "Failed to update order");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <h2 className="text-xl font-black text-foreground">Order #{order.orderNumber}</h2>
            <p className="text-xs text-muted-foreground">
              Placed {new Date(order.createdAt).toLocaleString("en-GB")}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6 p-6">
          {/* Customer & delivery */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs font-black uppercase text-muted-foreground">Customer</p>
              <p className="mt-2 text-sm font-bold text-foreground">{order.address?.fullName}</p>
              <p className="text-sm text-muted-foreground">{order.email}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="flex items-center gap-1.5 text-xs font-black uppercase text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                Delivery Address
              </p>
              <p className="mt-2 text-sm text-foreground">
                {order.address?.line1}
                {order.address?.line2 ? `, ${order.address.line2}` : ""}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.address?.city}, {order.address?.postcode}
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="flex items-center gap-1.5 text-xs font-black uppercase text-muted-foreground">
              <Package className="h-3.5 w-3.5" />
              Items ({order.items?.length ?? 0})
            </p>
            <div className="mt-3 divide-y divide-border rounded-lg border border-border">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.brand}
                      {item.strength ? ` · ${item.strength}` : ""} · Qty {item.qty}
                    </p>
                  </div>
                  <span className="ml-4 text-sm font-bold text-foreground">
                    {formatMoney(item.lineTotalMinor)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-lg border border-border p-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotalMinor)}</span>
              </div>
              {order.discountMinor > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount</span>
                  <span>-{formatMoney(order.discountMinor)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery</span>
                <span>{formatMoney(order.deliveryMinor)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-black text-foreground">
                <span>Total</span>
                <span>{formatMoney(order.totalMinor)}</span>
              </div>
            </div>
          </div>

          {/* Fulfilment controls */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <p className="flex items-center gap-1.5 text-xs font-black uppercase text-muted-foreground">
              <Truck className="h-3.5 w-3.5" />
              Fulfilment
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-muted-foreground" htmlFor="order-status">
                  Status
                </label>
                <select
                  id="order-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground" htmlFor="tracking-number">
                  Tracking Number
                </label>
                <input
                  id="tracking-number"
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. RM123456789GB"
                  className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold placeholder-muted-foreground"
                />
              </div>
            </div>

            {error && <p className="mt-3 text-sm font-bold text-destructive">{error}</p>}

            <div className="mt-4 flex justify-end gap-2">
              <span
                className={`mr-auto self-center rounded-full px-2.5 py-1 text-xs font-black capitalize ${
                  ORDER_STATUS_STYLES[order.status] || "bg-muted text-muted-foreground"
                }`}
              >
                Current: {order.status?.replace("_", " ")}
              </span>
              <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!hasChanges || saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
