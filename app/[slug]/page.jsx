import { notFound } from "next/navigation";
import Link from "next/link";
import { StoreShell } from "../components/storefront/store-shell";
import { SectionHeader } from "../components/storefront/section-header";
import { StatsGrid } from "../components/storefront/stats-grid";
import { TrustRail } from "../components/storefront/trust-badges";
import { ProductBrowser } from "../components/storefront/product-browser";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { ContactForm } from "../components/storefront/contact-form";
import { getCategories, getPage, getProducts } from "../lib/api";
import { featuredCollections } from "../siteData";

async function resolveRoute(slug) {
  const categories = await getCategories().catch(() => []);
  const category = categories.find((item) => item.slug === slug);
  if (category) {
    return {
      eyebrow: category.name,
      title: `${category.name}, with vape-specific discovery controls.`,
      description: category.description,
      stats: [
        [category.accent, "Focus area"],
        ["18+", "Regulated retail"],
        ["Tracked", "UK delivery"],
        ["Rewards", "Eligible spend"],
      ],
      mode: "products",
      category: slug,
    };
  }

  const collection = featuredCollections.find((item) => item.slug === slug);
  if (collection) {
    return {
      eyebrow: collection.title,
      title: collection.description,
      description: "Campaign collections support launches, starter journeys, and bundle pricing.",
      mode: "products",
      collection: slug,
    };
  }

  const page = await getPage(slug).catch(() => null);
  if (page) return { ...page, mode: "content" };

  return null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const route = await resolveRoute(slug);
  if (!route) return {};
  return { title: `${route.eyebrow} | Phoenix Vapers`, description: route.description };
}

export default async function DynamicPage({ params }) {
  const { slug } = await params;
  const route = await resolveRoute(slug);
  if (!route) notFound();

  const initialResult =
    route.mode === "products"
      ? await getProducts({ category: route.category, collection: route.collection, limit: 24 }).catch(() => null)
      : null;

  return (
    <StoreShell>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl md:p-10">
          <Badge>{route.eyebrow}</Badge>
          <h1 className="mt-5 max-w-4xl text-balance text-4xl font-black leading-[0.95] tracking-tight text-foreground sm:text-5xl">
            {route.title}
          </h1>
          <p className="mt-5 max-w-3xl text-pretty text-base leading-7 text-muted-foreground lg:text-lg">
            {route.description}
          </p>
          {route.cta ? (
            <Button className="mt-6" asChild>
              <Link href={route.ctaHref}>{route.cta}</Link>
            </Button>
          ) : null}
          {route.stats ? (
            <div className="mt-7">
              <StatsGrid stats={route.stats} />
            </div>
          ) : null}
        </div>
      </section>

      {route.mode === "products" ? (
        <ProductBrowser
          category={route.category}
          collection={route.collection}
          heading={route.eyebrow}
          initialResult={initialResult}
        />
      ) : null}

      {route.mode === "products" && !route.category && !route.collection ? (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <SectionHeader
            eyebrow="Trust before checkout"
            title="Concrete trust cues where ecommerce decisions happen."
            text="Delivery, age verification, payment security, and batch testing stay near catalogue interactions."
          />
          <TrustRail />
        </section>
      ) : null}

      {route.sections?.map((section) => <ContentSection key={section.title} section={section} />)}

      {route.faqs?.length ? (
        <section className="mx-auto max-w-4xl px-4 py-12">
          <SectionHeader
            eyebrow="Guided support"
            title="Buyer questions, answered before support is needed."
            align="center"
          />
          <Accordion type="single" collapsible className="rounded-xl border border-border bg-card px-6">
            {route.faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger className="text-base text-foreground">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-base leading-7">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ) : null}

      {route.form ? (
        <section className="mx-auto max-w-5xl px-4 py-12">
          <div className="grid gap-8 rounded-2xl border border-border bg-card p-6 shadow-xl lg:grid-cols-[0.85fr_1.15fr] lg:p-10">
            <div>
              <Badge>Support hub</Badge>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground">Contact Phoenix Vapers.</h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Order support, store questions, product guidance, and fault-based returns.
              </p>
            </div>
            <ContactForm />
          </div>
        </section>
      ) : null}

      {route.mode === "content" ? (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="rounded-xl bg-surface-dark p-8 text-surface-dark-foreground md:p-10">
            <Badge className="bg-primary text-primary-foreground">Ready to shop?</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-tight">Move back into the catalogue.</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-surface-dark-muted">
              Go from policy, support, or education content back into products without breaking your
              shopping flow.
            </p>
            <Button className="mt-6 bg-primary text-primary-foreground hover:opacity-90" asChild>
              <Link href="/shop">Return to shop</Link>
            </Button>
          </div>
        </section>
      ) : null}
    </StoreShell>
  );
}

function ContentSection({ section }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeader title={section.title} />
      {section.cards?.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {section.cards.map((card) => (
            <div key={card.title} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <Badge variant="secondary">{card.meta}</Badge>
              <h3 className="mt-6 text-lg font-black tracking-tight text-foreground">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.text}</p>
            </div>
          ))}
        </div>
      ) : null}
      {section.list?.length ? (
        <div className="grid gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
          {section.list.map((item) => (
            <p key={item} className="border-l-4 border-primary pl-4 text-base leading-7 text-muted-foreground">
              {item}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
