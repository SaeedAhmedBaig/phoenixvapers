import { CheckCircle2, ShieldCheck, Truck } from "lucide-react";
import { notFound } from "next/navigation";
import { StoreShell } from "../../components";
import { ProductGrid, ProductPurchasePanel, ProductVisual } from "../../interactive";
import { Badge, Rating, SectionHeader } from "../../ui";
import { products } from "../../siteData";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  if (!product) return {};
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();

  const relatedProducts = products
    .filter((item) => item.category === product.category && item.slug !== product.slug)
    .slice(0, 4);

  return (
    <StoreShell>
      <nav className="mx-auto max-w-7xl px-4 pt-6 text-xs font-black uppercase tracking-[0.14em] text-muted">
        <a className="hover:text-brand" href="/shop">
          Shop
        </a>{" "}
        /{" "}
        <a className="hover:text-brand" href={`/${product.category}`}>
          {product.category}
        </a>{" "}
        / <span className="text-ink">{product.brand}</span>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[0.9fr_1.1fr]">
        <ProductVisual
          product={product}
          className="min-h-[30rem] rounded-6xl p-8 shadow-2xl shadow-brand/10"
          size="text-8xl md:text-9xl"
        />

        <div className="rounded-6xl border border-line bg-white p-6 shadow-2xl shadow-brand/5 md:p-10">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand">{product.brand}</p>
            <Rating value={product.rating} reviews={product.reviews} />
          </div>
          <h1 className="mt-3 text-balance text-4xl font-black leading-[0.95] tracking-[-0.06em] text-ink md:text-6xl">
            {product.name}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted">{product.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {product.notes.map((note) => (
              <span key={note} className="rounded-full bg-soft px-3 py-1 text-xs font-black text-ink">
                {note}
              </span>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              [product.strength, "Strength / spec"],
              [product.flavour || product.format, product.flavour ? "Flavour profile" : "Format"],
              [product.stock === "low" ? "Low stock" : "In stock", "Dispatch before 2pm"],
              ["18+", "Age restricted"],
            ].map(([value, label]) => (
              <article key={label} className="rounded-3xl border border-line bg-cream p-4">
                <strong className="block text-lg font-black text-ink">{value}</strong>
                <span className="text-sm font-bold text-muted">{label}</span>
              </article>
            ))}
          </div>

          <ProductPurchasePanel product={product} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <SectionHeader
          eyebrow="Product intelligence"
          title="Everything needed to buy with confidence."
          text="Enterprise vape PDPs surface variants, stock, ratings, delivery, compliance, rewards, and support beside the buying action."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["Compliance", ShieldCheck, "18+ only, nicotine warnings, and age verification are part of the purchase flow."],
            ["Delivery", Truck, "Royal Mail Tracked 24/48 expectations are visible before checkout."],
            ["Returns", CheckCircle2, "Fault-based returns are explained clearly to reduce support confusion."],
          ].map(([title, Icon, text]) => (
            <article key={title} className="rounded-4xl border border-line bg-white p-6 shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-soft text-brand">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl font-black text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{text}</p>
            </article>
          ))}
        </div>
      </section>

      {relatedProducts.length ? (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <SectionHeader
            eyebrow="Related products"
            title="Keep customers in the right product family."
            action="Back to category"
            href={`/${product.category}`}
          />
          <ProductGrid products={relatedProducts} />
        </section>
      ) : null}
    </StoreShell>
  );
}
