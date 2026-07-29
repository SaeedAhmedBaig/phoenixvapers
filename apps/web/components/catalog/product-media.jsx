import { CategoryIcon } from "@/lib/category-icons";

function isPlaceholderUrl(url) {
  return !url || url.includes("placeholder.svg");
}

/**
 * Product image or category SVG icon when photography is not yet available.
 */
export function ProductMedia({
  product,
  className = "",
  iconClassName = "size-14 text-primary/30 sm:size-16",
  alt,
}) {
  const url = product.media?.[0]?.url ?? product.image?.url;
  const label = alt ?? product.media?.[0]?.alt ?? product.image?.alt ?? product.name;

  if (!isPlaceholderUrl(url)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={label} loading="lazy" className={className} />
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`} aria-hidden>
      <div className="bg-accent/60 flex size-20 items-center justify-center rounded-full sm:size-24">
        <CategoryIcon slug={product.category} className={iconClassName} />
      </div>
    </div>
  );
}
