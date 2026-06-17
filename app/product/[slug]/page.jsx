import { CheckCircle2, ShieldCheck, Star, Truck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Badge,
  ButtonLink,
  ProductGrid,
  SectionHeader,
  StoreShell,
} from "../../components";
import { products } from "../../siteData";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);

  if (!product) return {};

  return {
    title: `${product.name} | Phoenix Vapers`,
    description: product.description,
  };
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
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative min-h-[32rem] overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#203032] via-brand to-lime p-6 text-white shadow-2xl shadow-emerald-950/20">
          <div className="absolute right-[-8rem] top-[-8rem] h-80 w-80 rounded-full border border-white/20" />
          <Badge tone="lime">{product.badge}</Badge>
          <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
            <span className="text-8xl font-black tracking-[-0.12em] md:text-9xl">
              {product.brand.slice(0, 2).toUpperCase()}
            </span>
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-black backdrop-blur">
              {product.format}
            </span>
          </div>
        </div>

        <div className="rounded-[3rem] border border-[#2C3132]/10 bg-white p-6 shadow-2xl shadow-emerald-950/10 md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-brand">{product.brand}</p>
          <h1 className="mt-3 text-5xl font-black leading-[0.9] tracking-[-0.07em] text-[#2C3132] md:text-7xl">
            {product.name}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted">{product.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {product.notes.map((note) => (
              <span key={note} className="rounded-full bg-[#ecf5df] px-3 py-1 text-xs font-black text-[#2C3132]">
                {note}
              </span>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              [product.strength, "Strength / spec"],
              [`${product.rating} ★`, `${product.reviews} reviews`],
              ["In stock", "dispatch before 2pm"],
              ["18+", "age restricted"],
            ].map(([value, label]) => (
              <article key={label} className="rounded-3xl border border-[#2C3132]/10 bg-[#f8faf3] p-4">
                <strong className="block text-lg font-black text-[#2C3132]">{value}</strong>
                <span className="text-sm font-bold text-muted">{label}</span>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-[2rem] border border-[#2C3132]/10 bg-[#ecf5df] p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <strong className="block text-5xl font-black tracking-[-0.08em] text-[#2C3132]">
                  £{product.price.toFixed(2)}
                </strong>
                {product.compareAt ? <small className="font-bold text-muted line-through">Was £{product.compareAt.toFixed(2)}</small> : null}
              </div>
              <ButtonLink href="/cart" variant="dark">Add To Cart</ButtonLink>
            </div>
            <div className="mt-5 grid gap-3 text-sm font-bold text-[#2C3132] md:grid-cols-3">
              <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-brand" /> Free over £30</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand" /> Age verified</span>
              <span className="flex items-center gap-2"><Star className="h-4 w-4 text-brand" /> Points eligible</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <SectionHeader
          eyebrow="Product Intelligence"
          title="PDP built to answer purchase questions in seconds."
          text="Enterprise vape PDPs need variants, stock, ratings, delivery, compliance, rewards, and support beside the buying action."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["Compliance", "18+ only, nicotine warnings, and age verification are part of the purchase flow."],
            ["Delivery", "Royal Mail Tracked 24/48 expectations are visible before checkout."],
            ["Returns", "Fault-based returns are explained clearly to reduce support confusion."],
          ].map(([title, text]) => (
            <article key={title} className="rounded-[2rem] border border-[#2C3132]/10 bg-white p-6 shadow-sm">
              <CheckCircle2 className="h-7 w-7 text-brand" />
              <h3 className="mt-5 text-xl font-black text-[#2C3132]">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{text}</p>
            </article>
          ))}
        </div>
      </section>

      {relatedProducts.length ? (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <SectionHeader
            eyebrow="Related Products"
            title="Keep customers in the right product family."
            action="Back To Category"
            href={`/${product.category}`}
          />
          <ProductGrid products={relatedProducts} />
        </section>
      ) : null}
    </StoreShell>
  );
}
