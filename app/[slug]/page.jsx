import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StoreShell } from "../components";
import { ContactForm, ProductBrowser } from "../interactive";
import { Badge, ButtonLink, SectionHeader, StatsGrid } from "../ui";
import {
  categoryCards,
  featuredCollections,
  pageSlugs,
  pages,
  products,
} from "../siteData";

const allSlugs = [
  ...pageSlugs,
  ...categoryCards.map((category) => category.slug),
  ...featuredCollections.map((collection) => collection.slug),
];

export function generateStaticParams() {
  return [...new Set(allSlugs)].map((slug) => ({ slug }));
}

function getRoute(slug) {
  const category = categoryCards.find((item) => item.slug === slug);
  if (category) {
    const list = products.filter((product) => product.category === slug);
    return {
      kind: "browse",
      eyebrow: category.title,
      title: `${category.title} with vape-specific discovery controls.`,
      description: category.description,
      stats: [
        [category.count, "catalogue depth"],
        [`${list.length}`, "shown online"],
        ["18+", "regulated retail"],
        ["Tracked", "delivery ready"],
      ],
      products: list,
      content: pages[slug],
    };
  }

  const collection = featuredCollections.find((item) => item.slug === slug);
  if (collection) {
    const list = products.filter((product) => product.collection === slug);
    return {
      kind: "browse",
      eyebrow: collection.title,
      title: collection.description,
      description:
        "Campaign collections support launches, starter journeys, bundle pricing, and retention without custom one-off pages.",
      stats: [
        ["Campaign", "merchandising"],
        [`${list.length}`, "products"],
        ["Fast", "reorder paths"],
        ["Rewards", "eligible spend"],
      ],
      products: list,
      content: pages[slug],
    };
  }

  if (pages[slug]) return { kind: "content", ...pages[slug] };
  return null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const route = getRoute(slug);
  if (!route) return {};
  return { title: route.eyebrow, description: route.description };
}

function ContentSection({ section }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <SectionHeader title={section.title} />
      {section.cards ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {section.cards.map((card) => (
            <article key={card.title} className="rounded-4xl border border-line bg-white p-6 shadow-sm">
              <Badge tone="soft">{card.meta}</Badge>
              <h3 className="mt-8 text-2xl font-black tracking-[-0.05em] text-ink">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{card.text}</p>
            </article>
          ))}
        </div>
      ) : null}
      {section.list ? (
        <div className="grid gap-3 rounded-4xl border border-line bg-white p-6 shadow-sm">
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
        eyebrow="Guided support"
        title="Buyer questions answered before support is needed."
        text="Strong vape UX reduces confusion around nicotine strength, salts, shortfills, coils, and returns."
        align="center"
      />
      <div className="grid gap-3">
        {faqs.map((faq) => (
          <details key={faq.question} className="group rounded-3xl border border-line bg-white p-5 shadow-sm">
            <summary className="flex cursor-pointer items-center justify-between text-lg font-black text-ink">
              {faq.question}
              <span className="ml-4 grid h-8 w-8 flex-none place-items-center rounded-full bg-soft text-brand transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-4 text-sm leading-7 text-muted">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function ContactPanel() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid gap-8 rounded-5xl border border-line bg-white p-6 shadow-2xl shadow-brand/5 lg:grid-cols-[0.85fr_1.15fr] lg:p-10">
        <div>
          <Badge tone="brand">Support hub</Badge>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.06em] text-ink">Contact Phoenix Vapers.</h2>
          <p className="mt-4 text-base leading-8 text-muted">
            Frontend-ready form for order support, store questions, product guidance, and
            fault-based returns.
          </p>
        </div>
        <ContactForm />
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
        <div className="rounded-6xl border border-line bg-white p-6 shadow-2xl shadow-brand/5 md:p-10">
          <Badge tone="soft">{route.eyebrow}</Badge>
          <h1 className="mt-5 max-w-5xl text-balance text-4xl font-black leading-[0.95] tracking-[-0.06em] text-ink md:text-6xl">
            {route.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{route.description}</p>
          {route.cta ? (
            <ButtonLink className="mt-7" href={route.ctaHref}>
              {route.cta} <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          ) : null}
          <div className="mt-8">
            <StatsGrid stats={route.stats} />
          </div>
        </div>
      </section>

      {route.kind === "browse" ? (
        <>
          <ProductBrowser products={route.products} heading={route.eyebrow} />
          {route.content?.sections?.map((section) => (
            <ContentSection key={section.title} section={section} />
          ))}
        </>
      ) : null}

      {route.kind === "content" ? (
        <>
          {route.sections?.map((section) => (
            <ContentSection key={section.title} section={section} />
          ))}
          <FaqList faqs={route.faqs} />
          {route.form ? <ContactPanel /> : null}

          <section className="mx-auto max-w-7xl px-4 py-10">
            <div className="rounded-5xl bg-gradient-to-br from-ink to-[#101617] p-8 text-white md:p-10">
              <Badge tone="lime">Keep shopping</Badge>
              <h2 className="mt-5 text-4xl font-black tracking-[-0.06em]">Ready to shop with guidance?</h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/70">
                Move from policy, support, or education content back into the product catalogue
                without breaking the shopping flow.
              </p>
              <Link
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-black text-ink"
                href="/shop"
              >
                Return to shop <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </>
      ) : null}
    </StoreShell>
  );
}
