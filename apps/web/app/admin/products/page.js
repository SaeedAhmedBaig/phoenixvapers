import Link from "next/link";
import { formatPence } from "@phoenix/utils/money";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { operatorApi } from "@/lib/admin";

export const metadata = { title: "Catalogue" };

const STATUS_VARIANT = {
  draft: "secondary",
  review: "default",
  sellable: "default",
  retired: "destructive",
};

export default async function AdminProductsPage({ searchParams }) {
  const sp = await searchParams;
  const status = typeof sp?.status === "string" ? sp.status : "";
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const { items = [], counts = {} } = (await operatorApi(`/admin/products${query}`)) ?? {};

  const filters = [
    { key: "", label: "All" },
    { key: "draft", label: "Draft" },
    { key: "review", label: "In review" },
    { key: "sellable", label: "Sellable" },
    { key: "retired", label: "Retired" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-pine text-xs font-semibold tracking-widest uppercase">Catalogue</p>
          <h1 className="font-display mt-1 text-2xl font-medium sm:text-3xl">Products</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm"><a href="/admin/products/export">Export CSV</a></Button>
          <Button asChild variant="outline" size="sm"><a href="/admin/products/report" target="_blank" rel="noopener">PDF report</a></Button>
          <Button asChild variant="outline" size="sm"><Link href="/admin/products/import">Bulk import</Link></Button>
          <Button asChild size="sm"><Link href="/admin/products/new">New product</Link></Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button key={f.key} asChild size="sm" variant={status === f.key ? "default" : "outline"} className="rounded-none">
            <Link href={f.key ? `/admin/products?status=${f.key}` : "/admin/products"}>
              {f.label}
              {f.key && counts[f.key] != null ? ` (${counts[f.key]})` : ""}
            </Link>
          </Button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="border-border bg-card border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">No products yet. Create one to populate the storefront.</p>
          <Button asChild className="mt-4"><Link href="/admin/products/new">Create product</Link></Button>
        </div>
      ) : (
        <ul className="divide-border border-border divide-y border-y">
          {items.map((p) => {
            const price = p.variants?.find((v) => v.netPriceMinor != null)?.netPriceMinor;
            return (
              <li key={p._id ?? p.id}>
                <Link href={`/admin/products/${p._id ?? p.id}`} className="hover:bg-muted/40 flex items-center justify-between gap-4 py-3 transition-colors">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-muted-foreground truncate text-xs">{p.brand} · {p.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {price != null ? <span className="text-muted-foreground hidden font-mono text-xs sm:inline">{formatPence(price)} net</span> : null}
                    <Badge variant={STATUS_VARIANT[p.status] ?? "secondary"}>{p.status}</Badge>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
