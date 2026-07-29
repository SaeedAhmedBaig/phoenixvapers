"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, FlaskConical, List, MessageSquare, ShieldCheck } from "lucide-react";

import { AddToCartForm } from "@/components/catalog/add-to-cart-form";
import { Price, PriceBreakdown } from "@/components/catalog/price";
import { StockBadge } from "@/components/catalog/stock-badge";
import { WarningsBlock } from "@/components/catalog/warnings";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "spec", label: "Specification", icon: List },
  { id: "evidence", label: "Evidence", icon: ShieldCheck },
  { id: "reviews", label: "Reviews", icon: MessageSquare },
];

const TRUST = [
  "UK-made",
  "Batch-tested",
  "Age-verified dispatch",
];

function buildSpecs(product) {
  return [
    product.strengthMgPerMl != null && { label: "Nicotine strength", value: `${product.strengthMgPerMl}mg/ml` },
    product.volumeMl && { label: "Volume", value: `${product.volumeMl}ml` },
    product.vgPg && { label: "VG/PG ratio", value: product.vgPg },
    product.productType && { label: "Product type", value: product.productType },
    product.provenance?.madeIn && { label: "Made in", value: product.provenance.madeIn },
    product.provenance?.batchTested && { label: "Batch tested", value: "Independently risk-assessed" },
  ].filter(Boolean);
}

function buildSpecPills(product) {
  return [
    product.strengthMgPerMl != null && `${product.strengthMgPerMl}mg/ml`,
    product.volumeMl && `${product.volumeMl}ml`,
    product.vgPg,
    product.productType,
  ].filter(Boolean);
}

/**
 * Same flavour at other nicotine strengths (`product.strengthSiblings`,
 * see CatalogueService.getSellableBySlug) — each strength is its own
 * product/PDP (the compliance profile is legitimately singular per
 * product), so switching strength here is a real navigation, not client
 * state. Images stay the same because siblings share the same bottle art.
 */
function StrengthSwitcher({ product }) {
  if (!product.strengthSiblings?.length) return null;

  const options = [
    { slug: product.slug, strengthMgPerMl: product.strengthMgPerMl, current: true },
    ...product.strengthSiblings.map((s) => ({ ...s, current: false })),
  ].sort((a, b) => (a.strengthMgPerMl ?? 0) - (b.strengthMgPerMl ?? 0));

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-muted-foreground text-xs font-medium">Strength</span>
      {options.map((o) => (
        <Link
          key={o.slug}
          href={`/p/${o.slug}`}
          aria-current={o.current ? "page" : undefined}
          className={cn(
            "border font-mono text-xs px-2.5 py-1 transition-colors",
            o.current
              ? "border-primary bg-primary/10 text-pine font-semibold"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          {o.strengthMgPerMl}mg
        </Link>
      ))}
    </div>
  );
}

/** Title, buy box, and trust — pairs with the sticky gallery column. */
export function ProductDetailSummary({ product }) {
  const specPills = buildSpecPills(product);

  return (
    <div className="space-y-6 lg:pt-2">
      <div>
        <p className="text-pine text-xs font-semibold tracking-widest uppercase">{product.brand}</p>
        <h1 className="font-display mt-2 text-3xl font-medium leading-tight sm:text-4xl">{product.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StockBadge inStock={product.inStock} />
          {product.range ? (
            <span className="text-muted-foreground font-mono text-xs">{product.range}</span>
          ) : null}
        </div>
        {specPills.length ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {specPills.map((s) => (
              <span key={s} className="border-border bg-muted/50 font-mono rounded-none border px-3 py-1 text-xs">
                {s}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <StrengthSwitcher product={product} />

      <div className="overflow-hidden rounded-none border border-border/80 bg-card shadow-sm">
        <div className="bg-forest-ink/5 border-b border-border/60 px-5 py-4">
          <Price breakdown={product.fromPrice} className="text-3xl font-semibold" />
          <p className="text-muted-foreground mt-1 text-xs">Duty and VAT included</p>
          <PriceBreakdown breakdown={product.fromPrice} />
        </div>
        <div className="p-5">
          <AddToCartForm product={product} />
        </div>
      </div>

      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {TRUST.map((t) => (
          <li key={t} className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="text-primary size-3.5 shrink-0" />
            {t}
          </li>
        ))}
      </ul>

      {product.description ? (
        <p className="text-muted-foreground border-l-2 border-primary/30 pl-4 text-sm leading-relaxed">
          {product.description}
        </p>
      ) : null}
    </div>
  );
}

/** Variants, warnings, and tabs — full-width below the hero grid. */
export function ProductDetailContent({ product }) {
  const [tab, setTab] = useState("spec");
  const specs = buildSpecs(product);

  const hasVariants = product.variants?.length > 1;
  const hasWarnings = product.mandatedWarnings?.length > 0;

  return (
    <div className="border-border mt-10 space-y-8 border-t pt-10 lg:mt-12 lg:pt-12">
      {hasVariants ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Variants</p>
          <ul className="divide-y overflow-hidden rounded-none border border-border/80 text-sm">
            {product.variants.map((v) => (
              <li key={v.sku} className="flex items-center justify-between bg-card px-4 py-3">
                <span className="font-mono text-xs text-muted-foreground">{v.sku}</span>
                <div className="flex items-center gap-3">
                  <Price breakdown={v.price} className="text-sm font-semibold" />
                  <StockBadge inStock={v.inStock} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasWarnings ? <WarningsBlock warnings={product.mandatedWarnings} /> : null}

      <div>
        <div className="flex gap-1 overflow-x-auto pb-1" role="tablist">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-none px-4 py-2 text-sm font-medium transition-colors",
                tab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5" role="tabpanel">
          {tab === "spec" && specs.length ? (
            <dl className="overflow-hidden rounded-none border border-border/80 bg-card text-sm divide-y">
              {specs.map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-4 px-5 py-3.5">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {tab === "evidence" && (
            <div className="space-y-4">
              <div className="flex gap-4 rounded-none border border-border/80 bg-card p-5">
                <div className="bg-accent flex size-12 shrink-0 items-center justify-center rounded-none">
                  <FlaskConical className="text-pine size-6" />
                </div>
                <div>
                  <h3 className="font-medium">UK manufacture & testing</h3>
                  <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                    Manufactured in the United Kingdom, notified to the MHRA, and independently risk-assessed. Assessment available on request.
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === "reviews" && (
            <div className="rounded-none border border-dashed border-border py-12 text-center">
              <p className="text-sm font-medium">No reviews yet</p>
              <p className="text-muted-foreground mx-auto mt-1.5 max-w-sm text-sm">
                Only verified purchasers can review, so every rating you see here is from someone who actually bought this product. Be the first once you&apos;ve tried it.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use ProductDetailSummary + ProductDetailContent on the PDP. */
export function ProductDetailPanel({ product }) {
  return (
    <>
      <ProductDetailSummary product={product} />
      <ProductDetailContent product={product} />
    </>
  );
}
