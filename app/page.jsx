import Link from "next/link";
import { ArrowRight, ChevronRight, ShieldCheck, Sparkles, Truck, UserCheck } from "lucide-react";
import { StoreShell } from "./components/storefront/store-shell";
import { SectionHeader } from "./components/storefront/section-header";
import { ProductGrid } from "./components/storefront/product-grid";
import { TrustRail, CommerceTrustGrid } from "./components/storefront/trust-badges";
import { BrandMarquee } from "./components/storefront/brand-marquee";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { getCategories, getProducts } from "./lib/api";
import { featuredCollections } from "./siteData";

export const metadata = {
  title: "Phoenix Vapers | UK E-Liquids, Vape Kits & CBD",
  description:
    "Regulated UK vape retail: UK-made e-liquids, authentic vape hardware, coils, CBD, loyalty rewards, and tracked delivery.",
};

const heroStats = [
  ["18+", "Age-aware checkout"],
  ["£30", "Free Tracked 24"],
  ["1 pt", "Per £1 loyalty"],
  ["UK", "Manufactured"],
];

const buyingSteps = [
  ["1", "Choose your draw style", "MTL for cigarette-like draws, DTL for cloud and shortfill vaping."],
  ["2", "Pick a nicotine format", "Freebase, nic salts, 0mg shortfills with shots, or CBD products."],
  ["3", "Match device and coil", "Resistance and compatibility stay visible next to every product."],
  ["4", "Checkout with confidence", "Age verification, delivery, and rewards are clear before payment."],
];

export default async function Home() {
  const [categories, bestSellers] = await Promise.all([
    getCategories().catch(() => []),
    getProducts({ collection: "best-sellers", limit: 8 }).catch(() => ({ items: [] })),
  ]);

  return (
    <StoreShell>
      {/* Full-bleed hero */}
      <section className="relative overflow-hidden bg-card text-foreground dark:bg-foreground/10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(circle, var(--foreground) 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/30 blur-[100px] dark:bg-primary/20" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-primary/20 blur-[100px] dark:bg-primary/15" />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pb-14 pt-16 text-center md:pb-20 md:pt-24">
          <Badge className="bg-primary text-primary-foreground">
            <Sparkles className="h-3.5 w-3.5" /> UK vape retail, rebuilt
          </Badge>

          <h1 className="mt-6 text-balance text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
            Serious ecommerce for a <span className="text-primary">regulated</span> category.
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground lg:text-lg">
            UK-made e-liquids, authentic hardware, coils, and CBD — with age-aware checkout,
            faceted product discovery, a real basket, loyalty rewards, and tracked delivery.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/shop">
                Shop the storefront <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outlineInverse" asChild>
              <Link href="/faq">Find my vape</Link>
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-6 border-t border-border pt-8">
            {heroStats.map(([value, label]) => (
              <div key={label}>
                <strong className="block text-3xl font-black tracking-tight text-foreground sm:text-4xl">{value}</strong>
                <span className="mt-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BrandMarquee />

      {/* Compliance + offer split */}
      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-12 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl bg-secondary p-7 lg:col-span-1">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h2 className="mt-4 text-xl font-black leading-tight tracking-tight text-foreground">
            Age verification lives in checkout, not a weak popup.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Structured for API or payment-linked verification, keeping 18+ notices visible from
            browse to basket.
          </p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-primary">
            <UserCheck className="h-4 w-4" /> Structural, not procedural
          </span>
        </div>

        <Link
          href="/deals"
          className="group relative overflow-hidden rounded-xl bg-primary p-7 text-primary-foreground transition hover:-translate-y-0.5"
        >
          <span className="text-xs font-black uppercase tracking-wide">Limited offer</span>
          <strong className="mt-3 block text-5xl font-black tracking-tight">4 for £11</strong>
          <p className="mt-2 text-sm font-bold">Selected Bar Wars &amp; FiftyFifty Smooth 10ml ranges.</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-black">
            Shop the deal <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </Link>

        <div className="rounded-xl border border-border bg-card p-7">
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-primary">
            <Truck className="h-4 w-4" /> Delivery
          </span>
          <strong className="mt-3 block text-3xl font-black tracking-tight text-foreground">Tracked 24 over £30</strong>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Clear delivery cost visibility before checkout.</p>
        </div>
      </section>

      {categories.length ? (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <SectionHeader
            eyebrow="Commerce categories"
            title="Built for vape-specific product complexity."
            text="E-liquid shoppers need strength, flavour, and format guidance. Hardware shoppers need style, battery, coil, and experience-level guidance."
            action="View all"
            href="/shop"
          />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/${category.slug}`}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
              >
                <div className="absolute right-[-3rem] top-[-3rem] h-28 w-28 rounded-full bg-primary/10 transition group-hover:scale-125" />
                <span className="relative text-xs font-black uppercase tracking-wide text-primary">{category.accent}</span>
                <h3 className="relative mt-10 text-xl font-black tracking-tight text-foreground">{category.name}</h3>
                <p className="relative mt-3 text-sm leading-6 text-muted-foreground">{category.description}</p>
                <strong className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-black text-primary">
                  Shop now <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </strong>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {bestSellers.items?.length ? (
        <section className="mx-auto max-w-7xl px-4 py-8">
          <SectionHeader
            eyebrow="Product discovery"
            title="Best sellers, with clear pricing up front."
            text="Cards show purchase-critical information early, so customers can compare without opening every product."
            action="Shop catalogue"
            href="/shop"
          />
          <ProductGrid products={bestSellers.items} />
        </section>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl bg-surface-dark p-8 text-surface-dark-foreground md:p-10">
          <Badge className="bg-primary text-primary-foreground">Guided selling</Badge>
          <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            A vape finder, not just a product grid.
          </h2>
          <p className="mt-4 text-base leading-7 text-surface-dark-muted">
            Beginners and advanced shoppers are supported without exposing every technical option at
            once — progressive disclosure across the whole catalogue.
          </p>
          <Button className="mt-6 bg-primary text-primary-foreground hover:opacity-90" asChild>
            <Link href="/faq">Open buying guide</Link>
          </Button>
        </div>

        <div className="grid gap-4">
          {buyingSteps.map(([number, title, text]) => (
            <article key={title} className="grid grid-cols-[3rem_1fr] gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-secondary text-lg font-black text-foreground">
                {number}
              </span>
              <div>
                <h3 className="text-base font-black text-foreground">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <SectionHeader
          eyebrow="Trust architecture"
          title="Vape retail trust is a layer, not a badge pile."
          text="Compliance, delivery, payment confidence, and human support are placed across the buying journey."
        />
        <TrustRail />
        <CommerceTrustGrid className="mt-5" />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionHeader
          eyebrow="Merchandising"
          title="Collections built for campaigns and repeat purchase."
          text="Reusable collection slots support launches, bundles, starter kits, and top sellers."
        />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {featuredCollections.map((collection) => (
            <Link
              key={collection.slug}
              href={`/${collection.slug}`}
              className="group rounded-xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
            >
              <Badge variant="secondary">Collection</Badge>
              <h3 className="mt-10 text-xl font-black tracking-tight text-foreground">{collection.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{collection.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-primary">
                Explore collection <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </StoreShell>
  );
}
