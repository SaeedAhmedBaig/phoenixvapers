import Link from "next/link";

import { createProductAction } from "../actions";
import { ProductImageUploader } from "@/components/admin/product-image-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "New product" };

const CATEGORIES = [
  ["e-liquids", "E-Liquids"],
  ["nic-salts", "Nic Salts"],
  ["shortfills", "Shortfills"],
  ["hardware-kits", "Hardware & Kits"],
  ["coils-consumables", "Coils & Consumables"],
  ["accessories", "Accessories"],
  ["cbd", "CBD"],
];

export default async function NewProductPage({ searchParams }) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-pine text-xs font-semibold tracking-widest uppercase">Catalogue</p>
          <h1 className="font-display mt-1 text-2xl font-medium">New product</h1>
          <p className="text-muted-foreground mt-1 text-sm">Creates a draft. The compliance profile is set by a compliance officer before it can go live.</p>
        </div>
        <Button asChild variant="outline" size="sm"><Link href="/admin/products">Back</Link></Button>
      </div>

      {error ? <p className="border-destructive/40 bg-destructive/5 text-destructive border px-4 py-2 text-sm" role="alert">{error}</p> : null}

      <form action={createProductAction} className="space-y-6">
        <Card className="rounded-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" name="name" required /></div>
            <div className="space-y-2"><Label htmlFor="brand">Brand</Label><Input id="brand" name="brand" defaultValue="Phoenix" required /></div>
            <div className="space-y-2"><Label htmlFor="range">Range (optional)</Label><Input id="range" name="range" /></div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select id="category" name="category" required defaultValue="e-liquids" className="border-input bg-card h-10 w-full rounded-none border px-3 text-sm">
                {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <textarea id="description" name="description" rows={3} required className="border-input bg-card w-full rounded-none border px-3 py-2 text-sm" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Variant &amp; price</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="sku">SKU</Label><Input id="sku" name="sku" placeholder="PHX-XXX-001" required /></div>
            <div className="space-y-2"><Label htmlFor="netPriceMinor">Net price (pence)</Label><Input id="netPriceMinor" name="netPriceMinor" type="number" min="0" placeholder="599" required /></div>
            <div className="space-y-2"><Label htmlFor="strengthMgPerMl">Strength mg/ml (optional)</Label><Input id="strengthMgPerMl" name="strengthMgPerMl" type="number" min="0" /></div>
            <div className="space-y-2"><Label htmlFor="volumeMl">Volume ml (optional)</Label><Input id="volumeMl" name="volumeMl" type="number" min="0" /></div>
            <div className="space-y-2"><Label htmlFor="vgPg">VG/PG (optional)</Label><Input id="vgPg" name="vgPg" placeholder="50/50" /></div>
            <label className="flex items-center gap-2 pt-6 text-sm">
              <input type="checkbox" name="inStockStub" defaultChecked className="size-4" /> In stock
            </label>
          </CardContent>
        </Card>

        <Card className="rounded-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Images</CardTitle></CardHeader>
          <CardContent>
            <ProductImageUploader />
          </CardContent>
        </Card>

        <Card className="rounded-none shadow-sm">
          <CardHeader><CardTitle className="text-base">Provenance</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="madeIn">Made in</Label><Input id="madeIn" name="madeIn" defaultValue="United Kingdom" /></div>
            <label className="flex items-center gap-2 pt-6 text-sm">
              <input type="checkbox" name="batchTested" defaultChecked className="size-4" /> Batch tested
            </label>
          </CardContent>
        </Card>

        <Button type="submit" size="lg">Create draft</Button>
      </form>
    </div>
  );
}
