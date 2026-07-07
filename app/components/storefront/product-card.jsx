import Link from "next/link";
import { ProductVisual } from "./product-visual";
import { Rating } from "./rating";
import { Price } from "./price";
import { AddToCartButton } from "./add-to-cart-button";
import { Badge } from "../ui/badge";

export function ProductCard({ product }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
      {/* Image - fixed height */}
      <Link href={`/product/${product.slug}`} className="relative block h-40 sm:h-48 flex-shrink-0" aria-label={product.name}>
        <ProductVisual product={product} className="absolute inset-0" iconClassName="h-12 w-12 sm:h-14 sm:w-14" />
      </Link>

      {/* Content - grows to fill, pushes footer down */}
      <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-2.5 sm:p-4">
        {/* Brand & Rating */}
        <div className="flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          <span className="truncate">{product.brandName}</span>
          {product.ratingCount > 0 ? (
            <div className="flex-shrink-0">
              <Rating value={product.ratingAvg} reviews={product.ratingCount} />
            </div>
          ) : null}
        </div>

        {/* Product name - fixed to 2 lines */}
        <h3 className="line-clamp-2 text-sm font-black leading-tight tracking-tight text-foreground">
          <Link href={`/product/${product.slug}`} className="transition hover:text-primary">
            {product.name}
          </Link>
        </h3>

        {/* Notes/badges - hidden on mobile */}
        {product.notes?.length ? (
          <div className="hidden gap-1 sm:flex flex-wrap">
            {product.notes.slice(0, 2).map((note) => (
              <Badge key={note} variant="secondary" className="text-xs normal-case tracking-normal">
                {note}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      {/* Footer - price & button - always at bottom */}
      <div className="border-t border-border p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <Price minor={product.priceMinor} compareAtMinor={product.compareAtMinor} size="sm" />
          <AddToCartButton product={product} compact />
        </div>
      </div>
    </article>
  );
}
