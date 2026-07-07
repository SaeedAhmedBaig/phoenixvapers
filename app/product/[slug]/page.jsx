import { notFound } from "next/navigation";
import { CheckCircle2, ShieldCheck, Star, Truck } from "lucide-react";
import { StoreShell } from "../../components/storefront/store-shell";
import { SectionHeader } from "../../components/storefront/section-header";
import { Breadcrumbs } from "../../components/storefront/breadcrumbs";
import { ProductGrid } from "../../components/storefront/product-grid";
import { ProductVisual } from "../../components/storefront/product-visual";
import { Badge } from "../../components/ui/badge";
import { getProduct, getRelatedProducts, getReviews } from "../../lib/api";
import { PdpPurchasePanel } from "../../components/storefront/pdp-purchase-panel";
import { ReviewsSection } from "../../components/storefront/reviews-section";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);
  if (!product) return {};
  return { title: `${product.name} | Phoenix Vapers`, description: product.description };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedProducts(slug).catch(() => []),
    getReviews(slug).catch(() => ({ items: [], total: 0 })),
  ]);

  return (
    <StoreShell>
      <section className="mx-auto max-w-7xl px-4 pt-6">
        <Breadcrumbs items={[{ label: product.categorySlug, href: `/${product.categorySlug}` }, { label: product.name }]} />
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border shadow-xl lg:sticky lg:top-40 lg:self-start">
          <ProductVisual product={product} className="absolute inset-0" iconClassName="h-28 w-28" />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-primary">{product.brandName}</p>
          <h1 className="mt-2 text-balance text-3xl font-black leading-[1.05] tracking-tight text-foreground sm:text-4xl">
            {product.name}
          </h1>

          {product.ratingCount > 0 ? (
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-foreground">
              <Star className="h-4 w-4 fill-warning text-warning" /> {product.ratingAvg.toFixed(1)}
              <span className="text-muted-foreground">({product.ratingCount} reviews)</span>
            </p>
          ) : null}

          <p className="mt-4 text-pretty text-base leading-7 text-muted-foreground">{product.description}</p>

          {product.notes?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.notes.map((note) => (
                <Badge key={note} variant="secondary" className="normal-case tracking-normal">
                  {note}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Fact value={product.format} label="Format" />
            <Fact value={product.stockStatus === "out" ? "Out of stock" : "In stock"} label="Dispatch before 2pm" />
          </div>

          <PdpPurchasePanel product={product} />

          <SectionHeader
            className="mt-10 mb-6"
            eyebrow="Product intelligence"
            title="Built to answer purchase questions in seconds."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Compliance", "18+ only. Nicotine warnings and age verification are part of every purchase.", CheckCircle2],
              ["Delivery", "Royal Mail Tracked 24/48 estimates are shown before checkout.", Truck],
              ["Returns", "Fault-based returns are explained clearly to avoid confusion.", ShieldCheck],
            ].map(([title, text, Icon]) => (
              <article key={title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 text-base font-black text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <ReviewsSection
          productSlug={slug}
          initialReviews={reviews}
          ratingAvg={product.ratingAvg}
          ratingCount={product.ratingCount}
        />
      </section>

      {related.length ? (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <SectionHeader
            eyebrow="Related products"
            title="Keep browsing the right product family."
            action="Back to category"
            href={`/${product.categorySlug}`}
          />
          <ProductGrid products={related} />
        </section>
      ) : null}
    </StoreShell>
  );
}

function Fact({ value, label }) {
  return (
    <article className="rounded-3xl border border-border bg-muted p-4">
      <strong className="block text-base font-black text-foreground">{value}</strong>
      <span className="text-sm font-bold text-muted-foreground">{label}</span>
    </article>
  );
}
