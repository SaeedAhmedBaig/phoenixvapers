"use client";

import { useCallback, useEffect, useState } from "react";
import { Edit2, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useRequireStaff } from "../lib/admin-auth";
import { AdminLayout } from "../components/admin-layout";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { adminDeleteProduct, getBrands, getCategories, getProducts } from "../../lib/api";
import { formatMoney } from "../lib/export-csv";
import { ProductFormDialog } from "./components/product-form-dialog";

const STOCK_BADGES = {
  in: { label: "In Stock", className: "bg-success/10 text-success" },
  low: { label: "Low Stock", className: "bg-warning/10 text-warning" },
  out: { label: "Out of Stock", className: "bg-destructive/10 text-destructive" },
};

export default function ProductsPage() {
  const { ready, accessToken } = useRequireStaff();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // null = closed, {} = create, {product} = edit
  const [formTarget, setFormTarget] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts({ page, limit: 24, ...(search ? { q: search } : {}) });
      setProducts(res?.items ?? []);
      setTotal(res?.total ?? 0);
      setPages(res?.pages ?? 1);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError("Could not load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    if (ready) loadProducts();
  }, [ready, loadProducts]);

  useEffect(() => {
    if (!ready) return;
    Promise.all([getBrands(), getCategories()])
      .then(([b, c]) => {
        setBrands(Array.isArray(b) ? b : b?.items ?? []);
        setCategories(Array.isArray(c) ? c : c?.items ?? []);
      })
      .catch((err) => console.error("Failed to load brands/categories:", err));
  }, [ready]);

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(product.slug);
    try {
      await adminDeleteProduct(product.slug, accessToken);
      loadProducts();
    } catch (err) {
      console.error("Delete failed:", err);
      setError(err?.message || "Failed to delete product");
    } finally {
      setDeleting(null);
    }
  }

  if (!ready) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">Products</h1>
            <p className="mt-2 text-muted-foreground">
              {total} product{total !== 1 ? "s" : ""} in catalogue
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadProducts} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setFormTarget({})}>
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Search */}
        <form
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
        >
          <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, brand, or flavour — press Enter"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 bg-transparent text-sm font-bold placeholder-muted-foreground outline-none"
          />
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setPage(1);
              }}
            >
              Clear
            </Button>
          )}
        </form>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">
            {error}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : products.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const stock = STOCK_BADGES[product.stockStatus] || STOCK_BADGES.in;
              return (
                <div key={product.slug} className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase text-muted-foreground">
                        {product.brandName}
                      </p>
                      <h3 className="mt-1 truncate text-base font-black tracking-tight text-foreground">
                        {product.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {product.format} · {product.strength}
                        {product.flavour ? ` · ${product.flavour}` : ""}
                      </p>
                    </div>
                    <span className={`flex-shrink-0 rounded-lg px-2.5 py-1 text-xs font-black ${stock.className}`}>
                      {stock.label}
                    </span>
                  </div>

                  <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
                    <div>
                      <strong className="block text-xl font-black text-foreground">
                        {formatMoney(product.priceMinor)}
                      </strong>
                      {product.compareAtMinor > 0 && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatMoney(product.compareAtMinor)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFormTarget({ product })}
                        aria-label={`Edit ${product.name}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product)}
                        disabled={deleting === product.slug}
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {search ? `No products found for "${search}"` : "No products yet — add your first product"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && pages > 1 && (
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of {pages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create / edit dialog */}
      {formTarget && (
        <ProductFormDialog
          product={formTarget.product}
          brands={brands}
          categories={categories}
          accessToken={accessToken}
          onClose={() => setFormTarget(null)}
          onSaved={() => {
            setFormTarget(null);
            loadProducts();
          }}
        />
      )}
    </AdminLayout>
  );
}
