import { ProductCard } from "./product-card";
import { cn } from "../../lib/utils";

export function ProductGrid({ products, className }) {
  if (!products?.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
        <p className="text-base font-black text-foreground">No products found</p>
        <p className="mt-1 text-sm font-bold text-muted-foreground">Try a different filter or search term.</p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4", className)}>
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
