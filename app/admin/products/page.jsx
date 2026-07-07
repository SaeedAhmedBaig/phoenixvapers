"use client";

import { useState } from "react";
import { Plus, Search, Trash2, Edit2 } from "lucide-react";
import { useRequireStaff } from "../lib/admin-auth";
import { AdminLayout } from "../components/admin-layout";
import { Button } from "../../components/ui/button";

const MOCK_PRODUCTS = [
  { id: 1, sku: "BW-3-10", name: "Bar Wars 3mg 10ml", category: "E-Liquids", price: "£2.99", stock: 156, status: "Active" },
  { id: 2, sku: "FF-SMOOTH-20", name: "FiftyFifty Smooth 20mg", category: "Nic Salts", price: "£4.49", stock: 89, status: "Active" },
  { id: 3, sku: "VOOPOO-DRAG", name: "VooPoo Drag X Plus", category: "Devices", price: "£45.99", stock: 12, status: "Low Stock" },
  { id: 4, sku: "COIL-0.4", name: "Coils 0.4Ω (5 Pack)", category: "Accessories", price: "£3.99", stock: 234, status: "Active" },
  { id: 5, sku: "CBD-OIL-500", name: "CBD Oil 500mg", category: "CBD", price: "£16.99", stock: 0, status: "Out of Stock" },
];

export default function ProductsPage() {
  const { ready } = useRequireStaff();
  const [search, setSearch] = useState("");

  if (!ready) return null;

  const filtered = MOCK_PRODUCTS.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Products</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your product inventory and pricing</p>
          </div>
          <Button>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by product name or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm font-bold placeholder-muted-foreground outline-none"
          />
        </div>

        {/* Products Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <div key={product.id} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground">{product.category}</p>
                  <h3 className="mt-2 text-lg font-black tracking-tight text-foreground">{product.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">SKU: {product.sku}</p>
                </div>
                <ProductStatusBadge status={product.status} />
              </div>

              <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
                <div>
                  <strong className="block text-2xl font-black text-foreground">{product.price}</strong>
                  <p className="text-xs text-muted-foreground">{product.stock} in stock</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No products found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function ProductStatusBadge({ status }) {
  const colors = {
    Active: "bg-success/10 text-success",
    "Low Stock": "bg-warning/10 text-warning",
    "Out of Stock": "bg-destructive/10 text-destructive",
  };

  return (
    <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-black ${colors[status] || colors.Active}`}>
      {status}
    </span>
  );
}
