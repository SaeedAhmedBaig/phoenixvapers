import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ProductGrid,
  SectionHeader,
  StatsGrid,
  StoreShell,
} from "../components";
import {
  categoryCards,
  featuredCollections,
  pageSlugs,
  pages,
  products,
} from "../siteData";

const staticSlugs = [
  "shop",
  ...pageSlugs,
  ...categoryCards.map((category) => category.slug),
  ...featuredCollections.map((collection) => collection.slug),
];

export function generateStaticParams() {
  return [...new Set(staticSlugs)].map((slug) => ({ slug }));
}

function getRouteData(slug) {
  if (slug === "shop") {
    return {
      eyebrow: "Shop",
      title: "All Phoenix Vapers products in one polished storefront.",
      description:
        "Browse e-liquids, hardware, coils, CBD, deals, starter kits, and customer favourites from one ecommerce catalogue.",
      stats: [
        ["320+", "e-liquid options"],
        ["100+", "hardware products"],
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
      title: `${category.title} built for confident ecommerce shopping.`,
      description: category.description,
      stats: [
        [category.count, "range depth"],
        [category.accent, "shopping path"],
        ["18+", "regulated retail"],
        ["Rewards", "points eligible"],
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
        "Curated ecommerce collection pages help shoppers move from campaign, launch, or reorder intent directly into product cards.",
      stats: [
        ["Curated", "collection"],
        ["Fast", "reorder path"],
        ["Tracked", "delivery ready"],
        ["Points", "eligible spend"],
      ],
      products: products.filter((product) => product.collection === slug),
      mode: "collection",
    };
  }

  return pages[slug] ? { ...pages[slug], mode: "content" } : null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const route = getRouteData(slug);

  if (!route) {
    return {};
  }

  return {
    title: `${route.eyebrow} | Phoenix Vapers`,
    description: route.description,
  };
}

function ContentSection({ section }) {
  return (
    <section className="storeSection">
      <SectionHeader title={section.title} />

      {section.cards ? (
        <div className="categoryGrid">
          {section.cards.map((card) => (
            <article className="categoryCard" key={card.title}>
              <p>{card.meta}</p>
              <h3>{card.title}</h3>
              <span>{card.text}</span>
            </article>
          ))}
        </div>
      ) : null}

      {section.list ? (
        <div className="infoList">
          {section.list.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function FaqList({ faqs }) {
  if (!faqs?.length) {
    return null;
  }

  return (
    <section className="storeSection">
      <SectionHeader
        eyebrow="Support"
        title="Common Questions"
        text="Clear answers reduce abandoned baskets and help new vapers choose with confidence."
      />
      <div className="faqList">
        {faqs.map((faq) => (
          <details key={faq.question}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function ContactForm() {
  return (
    <section className="newsletter contactPanel">
      <div>
        <p className="eyebrow">Support Request</p>
        <h2>Send the team a message.</h2>
        <p>
          This frontend form is ready to connect to email, CRM, or order support
          tooling when backend handling is added.
        </p>
      </div>
      <form>
        <label htmlFor="name">Name</label>
        <input id="name" type="text" placeholder="Your name" />
        <label htmlFor="email">Email address</label>
        <input id="email" type="email" placeholder="you@example.com" />
        <label htmlFor="message">Message</label>
        <textarea id="message" placeholder="How can Phoenix Vapers help?" rows="5" />
        <button type="submit">Send Message</button>
      </form>
    </section>
  );
}

function CatalogueTools() {
  return (
    <aside className="catalogueTools" aria-label="Shop filters">
      <div>
        <strong>Shop Filters</strong>
        <span>Frontend-ready filter controls</span>
      </div>
      {["Format", "Brand", "Strength", "Vaping Style", "Price"].map((filter) => (
        <button key={filter} type="button">
          {filter}
        </button>
      ))}
    </aside>
  );
}

export default async function DynamicPage({ params }) {
  const { slug } = await params;
  const route = getRouteData(slug);

  if (!route) {
    notFound();
  }

  return (
    <StoreShell>
      <section className="pageHero">
        <div>
          <p className="eyebrow">{route.eyebrow}</p>
          <h1>{route.title}</h1>
          <p className="heroLead">{route.description}</p>
          {route.cta ? (
            <Link className="primaryButton" href={route.ctaHref}>
              {route.cta}
            </Link>
          ) : null}
        </div>
      </section>

      <StatsGrid stats={route.stats} />

      {route.products ? (
        <section className="storeSection catalogueLayout">
          <CatalogueTools />
          <div>
            <SectionHeader
              eyebrow={route.mode === "catalogue" ? "Catalogue" : "Products"}
              title={`${route.products.length} products ready to shop.`}
              text="Static product data is structured like a real ecommerce catalogue and can be wired to Shopify, WooCommerce, Stripe, or a custom backend later."
            />
            <ProductGrid products={route.products} />
          </div>
        </section>
      ) : null}

      {route.sections?.map((section) => (
        <ContentSection key={section.title} section={section} />
      ))}

      <FaqList faqs={route.faqs} />

      {route.form ? <ContactForm /> : null}
    </StoreShell>
  );
}
