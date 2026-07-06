import { ArrowRight, Sparkles, Truck, UserCheck } from "lucide-react";
import Link from "next/link";
import {
  CategoryTile,
  PromoStrip,
  StoreShell,
  TrustRail,
  commerceTrust,
} from "./components";
import { ProductGrid } from "./interactive";
import { Badge, ButtonLink, SectionHeader, StatsGrid } from "./ui";
import { categoryCards, featuredCollections, products, testimonials } from "./siteData";

const heroStats = [
  ["18+", "age-aware commerce"],
  ["£30", "free Tracked 24"],
  ["320+", "e-liquid options"],
  ["1 pt", "per £1 loyalty"],
];

const featuredProducts = products
  .filter((product) => ["new-arrivals", "best-sellers", "deals"].includes(product.collection))
  .slice(0, 8);

export default function Home() {
  return (
    <StoreShell>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-12">
        <div className="relative overflow-hidden rounded-6xl border border-line bg-white p-6 shadow-2xl shadow-brand/5 md:p-10">
          <div className="absolute right-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-lime/30 blur-3xl" />
          <div className="relative">
            <Badge tone="soft">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-brand" /> Regulated UK vape storefront
            </Badge>
            <h1 className="mt-5 max-w-4xl text-balance text-5xl font-black leading-[0.92] tracking-[-0.06em] text-ink md:text-7xl">
              Trusted vape retail with serious ecommerce UX.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              UK-made e-liquids, authentic hardware, coils, and CBD — with age-aware checkout,
              faceted product discovery, a real basket, loyalty rewards, and tracked delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/shop">
                Shop the storefront <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/faq" variant="outline">
                Find my vape
              </ButtonLink>
            </div>
            <div className="mt-8">
              <StatsGrid stats={heroStats} />
            </div>
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="relative overflow-hidden rounded-6xl bg-gradient-to-br from-ink to-[#101617] p-6 text-white shadow-2xl md:p-8">
            <Badge tone="lime">Compliance first</Badge>
            <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.05em] md:text-4xl">
              Age verification lives in checkout, not a weak popup.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/70">
              The journey is structured for API or payment-linked verification (AgeChecked, 1account,
              AgeVerifyUK) and keeps 18+ notices visible from browse to basket.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-lime">
              <UserCheck className="h-4 w-4" /> Structural, not procedural
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Link
              href="/deals"
              className="group rounded-5xl border border-line bg-lime p-6 text-ink transition hover:-translate-y-0.5"
            >
              <span className="text-sm font-black uppercase tracking-[0.18em]">Offer</span>
              <strong className="mt-3 block text-5xl font-black tracking-[-0.08em]">4 for £11</strong>
              <p className="mt-2 text-sm font-bold">
                Selected Bar Wars & FiftyFifty Smooth 10ml ranges.
              </p>
            </Link>
            <div className="rounded-5xl border border-line bg-white p-6">
              <span className="inline-flex items-center gap-1.5 text-sm font-black uppercase tracking-[0.18em] text-brand">
                <Truck className="h-4 w-4" /> Delivery
              </span>
              <strong className="mt-3 block text-3xl font-black tracking-[-0.06em] text-ink">
                Tracked 24 over £30
              </strong>
              <p className="mt-2 text-sm leading-6 text-muted">
                Clear delivery cost visibility before checkout.
              </p>
            </div>
          </div>
        </aside>
      </section>

      <PromoStrip />

      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionHeader
          eyebrow="Commerce categories"
          title="Built for vape-specific product complexity."
          text="E-liquid shoppers need strength, flavour, format, and device compatibility. Hardware shoppers need style, battery, coil, and experience-level guidance."
          action="View all"
          href="/shop"
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {categoryCards.map((category) => (
            <CategoryTile key={category.slug} category={category} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <SectionHeader
          eyebrow="Product discovery"
          title="PLP-grade cards with badges, ratings, formats, and clear pricing."
          text="Cards show purchase-critical information early, so customers can compare without opening every product."
          action="Shop catalogue"
          href="/shop"
        />
        <ProductGrid products={featuredProducts} />
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-6xl bg-gradient-to-br from-ink to-[#101617] p-8 text-white md:p-10">
          <Badge tone="lime">Guided selling</Badge>
          <h2 className="mt-5 text-4xl font-black leading-none tracking-[-0.06em] md:text-6xl">
            A vape finder, not just a product grid.
          </h2>
          <p className="mt-5 text-base leading-8 text-white/70">
            Beginners and advanced shoppers are supported without exposing every technical option at
            once — progressive disclosure used across enterprise ecommerce.
          </p>
          <ButtonLink className="mt-7" href="/faq" variant="lime">
            Open buying guide
          </ButtonLink>
        </div>

        <div className="grid gap-4">
          {[
            ["1", "Choose draw style", "MTL for cigarette-like draws, DTL for cloud and shortfill users."],
            ["2", "Select nicotine format", "Freebase, nic salts, 0mg shortfills with shots, or CBD products."],
            ["3", "Match device and coil", "Resistance and compatibility stay visible near product cards."],
            ["4", "Checkout with confidence", "Age, delivery, rewards, and returns are clear before payment."],
          ].map(([number, title, text]) => (
            <article
              key={title}
              className="grid grid-cols-[3rem_1fr] gap-4 rounded-4xl border border-line bg-white p-5 shadow-sm"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-lime text-lg font-black text-ink">
                {number}
              </span>
              <div>
                <h3 className="text-lg font-black text-ink">{title}</h3>
                <p className="mt-1 text-sm leading-7 text-muted">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <SectionHeader
          eyebrow="Trust architecture"
          title="Vape retail trust is a layer, not a badge pile."
          text="Compliance, delivery, payment confidence, lab standards, and human support are placed across the buying journey."
        />
        <TrustRail />
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {commerceTrust.map(({ title, text, icon: Icon }) => (
            <article key={title} className="rounded-4xl border border-line bg-white p-5 shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-soft text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-black text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionHeader
          eyebrow="Merchandising"
          title="Collections designed for campaigns and repeat purchase."
          text="Reusable collection slots support launches, bundles, starter kits, and top sellers without rebuilding page layouts."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featuredCollections.map((collection) => (
            <Link
              key={collection.slug}
              className="group rounded-4xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand/25 hover:shadow-2xl hover:shadow-brand/10"
              href={`/${collection.slug}`}
            >
              <Badge tone="soft">Collection</Badge>
              <h3 className="mt-12 text-2xl font-black tracking-[-0.05em] text-ink">
                {collection.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted">{collection.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-brand">
                Explore collection <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.author} className="rounded-4xl border border-line bg-soft p-6">
              <blockquote className="text-lg font-black leading-8 tracking-[-0.03em] text-ink">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-5 text-sm font-black uppercase tracking-[0.16em] text-brand">
                {testimonial.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </StoreShell>
  );
}
