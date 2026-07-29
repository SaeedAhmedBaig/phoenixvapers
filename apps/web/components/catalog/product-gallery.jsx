"use client";

import { useState } from "react";

import { ProductMedia } from "@/components/catalog/product-media";
import { cn } from "@/lib/utils";

function isPlaceholderUrl(url) {
  return !url || url.includes("placeholder.svg");
}

export function ProductGallery({ product }) {
  const media = product.media?.length
    ? product.media
    : [{ url: product.image?.url, alt: product.image?.alt ?? product.name }];

  const slides = media.filter((m) => m?.url);
  const [active, setActive] = useState(0);
  const current = slides[active] ?? slides[0];
  const showThumb = slides.length > 1 && slides.some((m) => !isPlaceholderUrl(m.url));

  return (
    <div className="space-y-3 lg:sticky lg:top-28">
      <div className="phx-product-well overflow-hidden rounded-xl border border-border/80 shadow-sm">
        <div className="relative aspect-square">
          {!isPlaceholderUrl(current?.url) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current.url}
              alt={current.alt ?? product.name}
              className="size-full object-contain p-10"
            />
          ) : (
            <ProductMedia
              product={product}
              className="size-full p-12"
              iconClassName="text-primary/30 size-24 sm:size-28"
            />
          )}
        </div>
      </div>

      {showThumb ? (
        <div className="grid grid-cols-4 gap-2">
          {slides.slice(0, 4).map((m, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "bg-product-well overflow-hidden rounded-md border-2 p-2 transition-colors",
                active === i ? "border-primary" : "border-transparent hover:border-border",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt="" className="aspect-square size-full object-contain" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
