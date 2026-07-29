import { ProductMedia } from "@/components/catalog/product-media";
import { Price } from "@/components/catalog/price";
import { QuickAddButton } from "@/components/catalog/quick-add-button";
import { StockBadge } from "@/components/catalog/stock-badge";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export function ProductCard({ product }) {
  const specs = [
    product.strengthMgPerMl != null && `${product.strengthMgPerMl}mg`,
    product.volumeMl && `${product.volumeMl}ml`,
    product.vgPg,
  ].filter(Boolean);

  return (
    <SpotlightCard href={`/p/${product.slug}`} className="flex h-full flex-col overflow-hidden p-0">
      <div className="bg-product-well relative aspect-square overflow-hidden">
        <StockBadge inStock={product.inStock} className="absolute top-2.5 left-2.5 z-10" />
        <ProductMedia
          product={product}
          className="size-full object-contain p-6 transition-transform duration-200 group-hover:scale-[1.02]"
          iconClassName="text-primary/30 size-10"
        />
        <QuickAddButton sku={product.sku} className="right-2.5 bottom-2.5 z-10" />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-pine text-[10px] font-semibold tracking-wide uppercase">{product.brand}</span>
          {product.range ? (
            <span className="text-muted-foreground font-mono text-[10px]">{product.range}</span>
          ) : null}
        </div>
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug">{product.name}</h3>
        {specs.length ? (
          <p className="text-muted-foreground font-mono text-[10px]">{specs.join(" · ")}</p>
        ) : (
          <span className="block h-[14px]" aria-hidden />
        )}
        <div className="border-border/60 flex items-baseline justify-between gap-2 border-t pt-2.5">
          <Price breakdown={product.fromPrice} prefix="from" className="text-sm font-semibold" />
          <span className="text-muted-foreground shrink-0 text-[10px]">incl. duty</span>
        </div>
      </div>
    </SpotlightCard>
  );
}
