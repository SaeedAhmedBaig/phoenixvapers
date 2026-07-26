import Link from "next/link";

import { ProductImportForm } from "@/components/admin/product-import-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Import products" };

export default function ImportProductsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-pine text-xs font-semibold tracking-widest uppercase">Catalogue</p>
          <h1 className="font-display mt-1 text-2xl font-medium">Bulk import</h1>
          <p className="text-muted-foreground mt-1 text-sm">Upload a CSV to create many products at once. Each row becomes a draft for compliance review before it can go live.</p>
        </div>
        <Button asChild variant="outline" size="sm"><Link href="/admin/products">Back</Link></Button>
      </div>

      <Card className="rounded-none shadow-sm">
        <CardHeader><CardTitle className="text-base">Upload CSV</CardTitle></CardHeader>
        <CardContent><ProductImportForm /></CardContent>
      </Card>

      <Card className="rounded-none shadow-sm">
        <CardHeader><CardTitle className="text-base">Format</CardTitle></CardHeader>
        <CardContent className="text-muted-foreground space-y-3 text-sm">
          <p>
            Columns: <span className="font-mono text-xs">name, brand, range, category, sku, netPriceMinor, inStock, strengthMgPerMl, volumeMl, vgPg, madeIn, batchTested, mediaUrl, mediaAlt, description</span>.
          </p>
          <p><span className="font-medium">category</span> must be one of: e-liquids, nic-salts, shortfills, hardware-kits, coils-consumables, accessories, cbd. <span className="font-medium">netPriceMinor</span> is pence (399 = £3.99). Booleans accept true/false.</p>
          <Button asChild variant="outline" size="sm"><a href="/admin/products/export?template=1">Download template CSV</a></Button>
        </CardContent>
      </Card>
    </div>
  );
}
