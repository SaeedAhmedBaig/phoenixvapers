"use client";

import { useEffect, useState } from "react";
import { Loader2, Package, MapPin, Calendar, ChevronRight } from "lucide-react";
import { getMyOrders } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";

export function OrdersTab({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!user?.accessToken) return;

    setLoading(true);
    getMyOrders(user.accessToken)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-lg font-bold text-foreground">No orders yet</p>
        <p className="mt-2 text-sm text-muted-foreground">Your orders will appear here once you make a purchase</p>
        <Button className="mt-6" asChild>
          <a href="/shop">Start shopping</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <button
          key={order.number}
          onClick={() => setSelectedOrder(order)}
          className="w-full rounded-lg border border-border bg-card p-4 text-left transition hover:border-primary/50 hover:bg-secondary"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="font-bold text-foreground">Order #{order.number}</div>
              <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {order.items.length} items
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-black text-lg text-foreground">£{(order.totalMinor / 100).toFixed(2)}</div>
              <div className={`mt-1 inline-block rounded-lg px-3 py-1 text-xs font-bold ${
                order.status === "delivered" ? "bg-success/10 text-success" :
                order.status === "shipped" ? "bg-primary/10 text-primary" :
                order.status === "pending" ? "bg-warning/10 text-warning" :
                "bg-muted text-muted-foreground"
              }`}>
                {order.status}
              </div>
              <ChevronRight className="mt-2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </button>
      ))}

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.number}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status */}
            <div>
              <h3 className="text-sm font-bold uppercase text-muted-foreground">Status</h3>
              <p className="mt-2 capitalize text-lg font-black text-foreground">{selectedOrder?.status}</p>
              <p className="text-xs text-muted-foreground">
                {selectedOrder?.status === "delivered" && "Your order has been delivered"}
                {selectedOrder?.status === "shipped" && "Your order is on the way"}
                {selectedOrder?.status === "pending" && "We're preparing your order"}
              </p>
            </div>

            {/* Items */}
            <div>
              <h3 className="text-sm font-bold uppercase text-muted-foreground">Items</h3>
              <div className="mt-3 space-y-2">
                {selectedOrder?.items.map((item) => (
                  <div key={item.product} className="flex justify-between text-sm">
                    <span className="text-foreground">{item.name} × {item.qty}</span>
                    <span className="font-bold text-foreground">£{(item.lineTotalMinor / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-border pt-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>£{((selectedOrder?.totalMinor || 0) / 100).toFixed(2)}</span>
              </div>
              {selectedOrder?.deliveryMinor > 0 && (
                <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                  <span>Delivery</span>
                  <span>£{(selectedOrder.deliveryMinor / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="mt-3 flex justify-between border-t border-border pt-3 text-lg font-black">
                <span>Total</span>
                <span>£{((selectedOrder?.totalMinor || 0) / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button className="w-full" variant="outline">
                Download Invoice
              </Button>
              <Button className="w-full" variant="outline">
                Contact Support
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
