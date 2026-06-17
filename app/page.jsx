import Link from "next/link";
import {
  Badge,
  ButtonLink,
  CategoryTile,
  ProductGrid,
  PromoStrip,
  SectionHeader,
  StatsGrid,
  StoreShell,
  TrustRail,
  commerceTrust,
} from "./components";
import {
  categoryCards,
  featuredCollections,
  products,
  testimonials,
} from "./siteData";

const heroStats = [
  ["18+", "age-aware commerce"],
  ["£30", "free Tracked 24"],
  ["320+", "e-liquid options"],
  ["34", "static storefront pages"],
];

const featuredProducts = products
  .filter((product) => ["new-arrivals", "best-sellers", "deals"].includes(product.collection))
  .slice(0, 8);

export default function Home() {
  return (
    <StoreShell>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-12">
        <div className="relative overflow-hidden rounded-[3rem] border border-[#2C3132]/10 bg-white p-6 shadow-2xl shadow-emerald-950/10 md:p-10">
          <div className="absolute right-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-lime/30 blur-3xl" />
          <div className="relative">
            <Badge tone="green">Enterprise vape storefront</Badge>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.075em] text-[#2C3132] md:text-7xl lg:text-8xl">
              Regulated vape retail with serious ecommerce UX.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              Phoenix Vapers now has a headless-ready frontend for compliant UK
              vape retail: age-aware checkout, faceted product discovery, product
              detail pages, cart, loyalty, delivery, and trust architecture.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/shop">Shop The Storefront</ButtonLink>
              <ButtonLink href="/faq" variant="outline">Find My Vape</ButtonLink>
            </div>
            <div className="mt-8">
              <StatsGrid stats={heroStats} />
            </div>
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="rounded-[3rem] bg-[#2C3132] p-6 text-white shadow-2xl shadow-slate-950/20 md:p-8">
            <Badge tone="lime">Compliance first</Badge>
            <h2 className="mt-5 text-4xl font-black leading-none tracking-[-0.06em]">
              Age verification belongs in checkout, not as a weak popup.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/70">
              R&D points toward API or payment-linked verification for vape sales.
              The UI is structured for providers such as AgeChecked, 1account, or
              AgeVerifyUK and keeps 18+ notices visible across the journey.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[2rem] border border-[#2C3132]/10 bg-lime p-6 text-[#2C3132]">
              <span className="text-sm font-black uppercase tracking-[0.18em]">Offer</span>
              <strong className="mt-3 block text-5xl font-black tracking-[-0.08em]">4 for £11</strong>
              <p className="mt-2 text-sm font-bold">Selected Bar Wars and FiftyFifty Smooth 10ml ranges.</p>
            </div>
            <div className="rounded-[2rem] border border-[#2C3132]/10 bg-white p-6">
              <span className="text-sm font-black uppercase tracking-[0.18em] text-brand">Delivery</span>
              <strong className="mt-3 block text-3xl font-black tracking-[-0.06em]">Tracked 24 over £30</strong>
              <p className="mt-2 text-sm leading-6 text-muted">Clear delivery cost visibility before checkout.</p>
            </div>
          </div>
        </aside>
      </section>

      <PromoStrip />

      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionHeader
          eyebrow="Commerce Categories"
          title="Built for vape-specific product complexity."
          text="E-liquid shoppers need strength, flavour, format, and device compatibility. Hardware shoppers need style, battery, coil, and experience-level guidance."
          action="View All"
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
          eyebrow="Product Discovery"
          title="PLP-grade cards with badges, ratings, formats, notes, and clear pricing."
          text="Enterprise PLPs should help customers compare without opening every product. Cards now show purchase-critical information early."
          action="Shop Catalogue"
          href="/shop"
        />
        <ProductGrid products={featuredProducts} />
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[3rem] bg-[#2C3132] p-8 text-white md:p-10">
          <Badge tone="lime">Guided selling</Badge>
          <h2 className="mt-5 text-4xl font-black leading-none tracking-[-0.06em] md:text-6xl">
            A vape finder, not just a product grid.
          </h2>
          <p className="mt-5 text-base leading-8 text-white/70">
            The design supports beginner and advanced shoppers without exposing
            every technical option at once. This follows progressive disclosure
            patterns used in enterprise ecommerce.
          </p>
          <ButtonLink className="mt-7" href="/faq" variant="lime">
            Open Buying Guide
          </ButtonLink>
        </div>

        <div className="grid gap-4">
          {[
            ["1", "Choose draw style", "MTL for cigarette-like draws, DTL for cloud and shortfill users."],
            ["2", "Select nicotine format", "Freebase, nic salts, 0mg shortfills with shots, or CBD products."],
            ["3", "Match device and coil", "Resistance and compatibility stay visible near product cards."],
            ["4", "Checkout with confidence", "Age, delivery, rewards, and return conditions are clear before payment."],
          ].map(([number, title, text]) => (
            <article key={title} className="grid grid-cols-[3rem_1fr] gap-4 rounded-[2rem] border border-[#2C3132]/10 bg-white p-5 shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-lime text-lg font-black text-[#2C3132]">
                {number}
              </span>
              <div>
                <h3 className="text-lg font-black text-[#2C3132]">{title}</h3>
                <p className="mt-1 text-sm leading-7 text-muted">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <SectionHeader
          eyebrow="Trust Architecture"
          title="Vape retail trust is a layer, not a badge pile."
          text="Compliance, delivery, payment confidence, lab standards, and human support are placed across the buying journey."
        />
        <TrustRail />
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {commerceTrust.map(({ title, text, icon: Icon }) => (
            <article key={title} className="rounded-[2rem] border border-[#2C3132]/10 bg-white p-5 shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ecf5df] text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-black text-[#2C3132]">{title}</h3>
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
              className="group rounded-[2rem] border border-[#2C3132]/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/10"
              href={`/${collection.slug}`}
            >
              <Badge tone="soft">Collection</Badge>
              <h3 className="mt-12 text-2xl font-black tracking-[-0.05em] text-[#2C3132]">
                {collection.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted">{collection.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-brand">
                Explore collection
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.author} className="rounded-[2rem] border border-[#2C3132]/10 bg-[#ecf5df] p-6">
              <blockquote className="text-lg font-black leading-8 tracking-[-0.03em] text-[#2C3132]">
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
