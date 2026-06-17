import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Badge,
  ButtonLink,
  FilterPanel,
  ProductGrid,
  SectionHeader,
  StatsGrid,
  StoreShell,
  TrustRail,
} from "../components";
import {
  categoryCards,
  featuredCollections,
  pageSlugs,
  pages,
  products,
} from "../siteData";

const allSlugs = [
  "shop",
  ...pageSlugs,
  ...categoryCards.map((category) => category.slug),
  ...featuredCollections.map((collection) => collection.slug),
];

export function generateStaticParams() {
  return [...new Set(allSlugs)].map((slug) => ({ slug }));
}

function getRoute(slug) {
  if (slug === "shop") {
    return {
      eyebrow: "Shop",
      title: "Enterprise product discovery for Phoenix Vapers.",
      description:
        "A full PLP experience with reusable product cards, filter chips, collection merchandising, trust cues, and real category architecture.",
      stats: [
        ["320+", "e-liquid options"],
        ["100+", "hardware range"],
        ["68", "coil and pod essentials"],
        ["£30", "free delivery threshold"],
      ],
      products,
      mode: "catalogue",
    };
  }

  const category = categoryCards.find((item) => item.slug === slug);
  if (category) {
    return {
      eyebrow: category.title,
      title: `${category.title} with vape-specific discovery controls.`,
      description: category.description,
      stats: [
        [category.count, "catalogue depth"],
        [category.accent, "key decision path"],
        ["18+", "regulated retail"],
        ["Tracked", "delivery ready"],
      ],
      products: products.filter((product) => product.category === slug),
      mode: "category",
    };
  }

  const collection = featuredCollections.find((item) => item.slug === slug);
  if (collection) {
    return {
      eyebrow: collection.title,
      title: collection.description,
      description:
        "Campaign collections support launches, starter journeys, bundle pricing, and retention without custom one-off pages.",
      stats: [
        ["Campaign", "merchandising"],
        ["Reusable", "collection template"],
        ["Fast", "reorder paths"],
        ["Rewards", "eligible spend"],
      ],
      products: products.filter((product) => product.collection === slug),
      mode: "collection",
    };
  }

  return pages[slug] ? { ...pages[slug], mode: "content" } : null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const route = getRoute(slug);

  if (!route) return {};

  return {
    title: `${route.eyebrow} | Phoenix Vapers`,
    description: route.description,
  };
}

function ContentSection({ section }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeader title={section.title} />

      {section.cards ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {section.cards.map((card) => (
            <article key={card.title} className="rounded-[2rem] border border-[#2C3132]/10 bg-white p-6 shadow-sm">
              <Badge tone="soft">{card.meta}</Badge>
              <h3 className="mt-8 text-2xl font-black tracking-[-0.05em] text-[#2C3132]">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{card.text}</p>
            </article>
          ))}
        </div>
      ) : null}

      {section.list ? (
        <div className="grid gap-3 rounded-[2rem] border border-[#2C3132]/10 bg-white p-6 shadow-sm">
          {section.list.map((item) => (
            <p key={item} className="border-l-4 border-lime pl-4 text-base leading-8 text-muted">
              {item}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function FaqList({ faqs }) {
  if (!faqs?.length) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <SectionHeader
        eyebrow="Guided Support"
        title="Buyer questions answered before support is needed."
        text="Strong vape UX reduces confusion around nicotine strength, salts, shortfills, coils, and returns."
        align="center"
      />
      <div className="grid gap-3">
        {faqs.map((faq) => (
          <details key={faq.question} className="rounded-3xl border border-[#2C3132]/10 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer text-lg font-black text-[#2C3132]">{faq.question}</summary>
            <p className="mt-4 text-sm leading-7 text-muted">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function ContactForm() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid gap-8 rounded-[2.5rem] border border-[#2C3132]/10 bg-white p-6 shadow-2xl shadow-emerald-950/10 lg:grid-cols-[0.85fr_1.15fr] lg:p-10">
        <div>
          <Badge tone="green">Support Hub</Badge>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.06em] text-[#2C3132]">Contact Phoenix Vapers.</h2>
          <p className="mt-4 text-base leading-8 text-muted">
            Frontend-ready form for order support, store questions, product guidance,
            and fault-based returns.
          </p>
        </div>
        <form className="grid gap-4">
          {["Name", "Email address", "Order number"].map((label) => (
            <label key={label} className="grid gap-2 text-sm font-black text-[#2C3132]">
              {label}
              <input className="min-h-12 rounded-full border border-[#2C3132]/10 px-5 outline-none ring-brand/20 focus:ring-4" />
            </label>
          ))}
          <label className="grid gap-2 text-sm font-black text-[#2C3132]">
            Message
            <textarea className="min-h-36 rounded-3xl border border-[#2C3132]/10 p-5 outline-none ring-brand/20 focus:ring-4" />
          </label>
          <button className="min-h-12 rounded-full bg-brand px-6 text-sm font-black text-white" type="submit">
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}

export default async function DynamicPage({ params }) {
  const { slug } = await params;
  const route = getRoute(slug);

  if (!route) notFound();

  return (
    <StoreShell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-[3rem] border border-[#2C3132]/10 bg-white p-6 shadow-2xl shadow-emerald-950/10 md:p-10">
          <Badge tone="green">{route.eyebrow}</Badge>
          <h1 className="mt-5 max-w-5xl text-5xl font-black leading-[0.9] tracking-[-0.075em] text-[#2C3132] md:text-7xl">
            {route.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{route.description}</p>
          {route.cta ? (
            <ButtonLink className="mt-7" href={route.ctaHref}>
              {route.cta}
            </ButtonLink>
          ) : null}
          <div className="mt-8">
            <StatsGrid stats={route.stats} />
          </div>
        </div>
      </section>

      {route.products ? (
        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[280px_1fr]">
          <FilterPanel />
          <div>
            <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-[#2C3132]/10 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-brand">Product Listing Page</p>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-[#2C3132]">
                  {route.products.length} products
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Best Match", "Top Rated", "Price", "Newest"].map((sort) => (
                  <button key={sort} className="rounded-full border border-[#2C3132]/10 px-4 py-2 text-xs font-black text-muted hover:text-brand" type="button">
                    {sort}
                  </button>
                ))}
              </div>
            </div>
            <ProductGrid products={route.products} />
          </div>
        </section>
      ) : null}

      {route.mode === "catalogue" ? (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <SectionHeader
            eyebrow="Trust Before Checkout"
            title="Concrete trust cues where ecommerce decisions happen."
            text="Delivery, age verification, payment security, and batch testing stay near catalogue interactions."
          />
          <TrustRail />
        </section>
      ) : null}

      {route.sections?.map((section) => (
        <ContentSection key={section.title} section={section} />
      ))}

      <FaqList faqs={route.faqs} />
      {route.form ? <ContactForm /> : null}

      {route.mode === "content" ? (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="rounded-[2.5rem] bg-[#2C3132] p-8 text-white md:p-10">
            <Badge tone="lime">Commerce CTA</Badge>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.06em]">Ready to shop with guidance?</h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/70">
              Move from policy, support, or education content back into the product
              catalogue without breaking the shopping flow.
            </p>
            <Link className="mt-7 inline-flex rounded-full bg-lime px-5 py-3 text-sm font-black text-[#2C3132]" href="/shop">
              Return To Shop
            </Link>
          </div>
        </section>
      ) : null}
    </StoreShell>
  );
}
