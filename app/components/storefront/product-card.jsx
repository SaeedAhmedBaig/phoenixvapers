import Link from "next/link";
import { ProductVisual } from "./product-visual";
import { Rating } from "./rating";
import { Price } from "./price";
import { AddToCartButton } from "./add-to-cart-button";
import { Badge } from "../ui/badge";

export function ProductCard({ product }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[5/4] sm:aspect-[4/3]" aria-label={product.name}>
        <ProductVisual product={product} className="absolute inset-0" iconClassName="h-12 w-12 sm:h-14 sm:w-14" />
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-4 sm:gap-3 sm:p-5">
        <div className="flex items-center justify-between gap-2 text-xs font-black uppercase tracking-wide text-muted-foreground">
          <span className="truncate">{product.brandName}</span>
          {product.ratingCount > 0 ? <Rating value={product.ratingAvg} reviews={product.ratingCount} /> : null}
        </div>

        <h3 className="line-clamp-2 text-sm font-black leading-snug tracking-tight text-foreground sm:text-base">
          <Link href={`/product/${product.slug}`} className="transition hover:text-primary">
            {product.name}
          </Link>
        </h3>

        {product.notes?.length ? (
          <div className="hidden flex-wrap gap-1.5 sm:flex">
            {product.notes.slice(0, 2).map((note) => (
              <Badge key={note} variant="secondary" className="normal-case tracking-normal">
                {note}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3 sm:pt-4">
          <Price minor={product.priceMinor} compareAtMinor={product.compareAtMinor} size="sm" />
          <AddToCartButton product={product} compact />
        </div>
      </div>
    </article>
  );
}
