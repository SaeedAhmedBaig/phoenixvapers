import Link from "next/link";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { formatPence } from "@phoenix/utils/money";

import { Button } from "@/components/ui/button";
import { AuthRequiredError, customerApi } from "@/lib/auth";
import { orderStatusClasses, orderStatusLabel } from "@/lib/orders";

export const metadata = { title: "My orders" };

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function OrdersPage() {
  let data;
  try {
    data = await customerApi("/orders");
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect(`/auth/refresh?next=${encodeURIComponent("/account/orders")}`);
    }
    throw error;
  }

  const orders = data?.items ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-pine text-xs font-semibold tracking-widest uppercase">Account</p>
          <h1 className="font-display mt-2 text-3xl font-medium">My orders</h1>
        </div>
        <Button asChild variant="outline"><Link href="/account">Back to account</Link></Button>
      </div>

      {orders.length === 0 ? (
        <div className="border-border bg-card border p-10 text-center">
          <div className="bg-accent/60 mx-auto flex size-12 items-center justify-center rounded-full">
            <Package className="text-primary/50 size-5" />
          </div>
          <p className="mt-4 text-sm font-medium">No orders yet</p>
          <p className="text-muted-foreground mt-1 text-sm">When you place an order it will appear here.</p>
          <Button asChild className="mt-5"><Link href="/c/e-liquids">Start shopping</Link></Button>
        </div>
      ) : (
        <ul className="divide-border border-border divide-y border-y">
          {orders.map((o) => (
            <li key={o.orderNumber}>
              <Link
                href={`/account/orders/${o.orderNumber}`}
                className="hover:bg-muted/40 flex items-center justify-between gap-4 py-4 transition-colors"
              >
                <div>
                  <p className="font-mono text-sm font-medium">{o.orderNumber}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {dateFmt.format(new Date(o.placedAt))} · {o.itemCount} {o.itemCount === 1 ? "item" : "items"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`hidden border px-2 py-0.5 text-xs font-medium sm:inline-block ${orderStatusClasses(o.status)}`}>
                    {orderStatusLabel(o.status)}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{formatPence(o.totals.totalMinor)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
