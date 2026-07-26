import Link from "next/link";
import { ArrowRight, Beaker, FlaskConical, Package, RefreshCw, Scale, ShoppingBag, Sparkles, Truck, UserPlus } from "lucide-react";

import { ProductCard } from "@/components/catalog/product-card";
import { CategoryTile } from "@/components/catalog/category-tile";
import { SectionEyebrow } from "@/components/home/section-eyebrow";
import { TrustStrip } from "@/components/home/trust-strip";
import { RevealHeading } from "@/components/motion/reveal-heading";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { apiGet } from "@/lib/api";
import { CATEGORIES } from "@/lib/categories";

export const metadata = { title: "Phoenix Vapers" };

const PERSONAS = [
  {
    icon: UserPlus,
    tag: "Switcher",
    title: "New to vaping",
    desc: "A calm introduction for adults moving away from cigarettes.",
    href: "/guidance",
    cta: "Start the guide",
  },
  {
    icon: ShoppingBag,
    tag: "Enthusiast",
    title: "Know what I want",
    desc: "Search, filter by spec, and reorder in a few clicks.",
    href: "/c/e-liquids",
    cta: "Shop catalogue",
  },
  {
    icon: RefreshCw,
    tag: "Convenience",
    title: "Subscribe & save",
    desc: "Your usual order on your schedule. Pause or skip anytime.",
    href: "/c/e-liquids",
    cta: "Browse eligible products",
  },
  {
    icon: Package,
    tag: "Trade",
    title: "Wholesale",
    desc: "Trade pricing, bulk ordering, and compliance documentation.",
    href: "/wholesale",
    cta: "Trade gateway",
  },
];

const GUIDES = [
  { icon: Scale, tag: "Strength", title: "Strength guide", desc: "Match nicotine intake to the right mg/ml.", href: "/guidance/strength" },
  { icon: FlaskConical, tag: "Flavours", title: "Flavour finder", desc: "Explore profiles from menthol to dessert.", href: "/guidance/flavours" },
  { icon: Beaker, tag: "Devices", title: "Device chooser", desc: "Pod, MTL, or mod — what suits your style.", href: "/guidance" },
];

const PROCESS = [
  { step: "01", title: "Browse & order", desc: "Duty-inclusive prices shown on every product." },
  { step: "02", title: "Age verified", desc: "Quick, secure check at checkout — framed as care." },
  { step: "03", title: "Same-day dispatch", desc: "Order before 2pm Mon–Fri for same working day." },
  { step: "04", title: "Tracked delivery", desc: "Proactive updates from dispatch to your door." },
];

const EVIDENCE = [
  { title: "UK manufacture", desc: "Made and filled in our Peterborough facility.", href: "/our-standard" },
  { title: "Batch testing", desc: "Every batch independently risk-assessed.", href: "/our-standard" },
  { title: "MHRA notified", desc: "Every product notified under UK TPD framework.", href: "/our-standard" },
];

const FAQ = [
  { q: "Why do you verify age?", a: "We verify at checkout and on delivery where required. It protects everyone and is non-negotiable for a responsible retailer." },
  { q: "Are prices duty-inclusive?", a: "Yes. Every price shown includes vaping products duty and VAT. Expand any product for a full breakdown." },
  { q: "What if I pick the wrong strength?", a: "Our strength guide helps you match your current intake. Unopened products can be returned within our policy." },
  { q: "How do subscriptions work?", a: "Choose a cadence, save on every repeat order, and pause or skip anytime. You stay in control." },
];

export default async function HomePage() {
  const { items = [] } = (await apiGet("/products?limit=8&sort=newest")) ?? {};

  return (
    <>
      {/* Hero */}
      <section className="phx-hero border-border border-b">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-20 lg:py-28">
          <SectionEyebrow className="mb-4">UK-made · Batch-tested · MHRA notified</SectionEyebrow>
          <RevealHeading
            className="font-display text-4xl leading-[1.1] font-medium tracking-tight sm:text-5xl lg:text-[3.5rem]"
            words={[
              { text: "The" },
              { text: "Standard" },
              { text: "of", break: true },
              { text: "Trust.", className: "text-pine" },
            ]}
          />
          <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
            UK-made, batch-tested vaping products with duty-inclusive pricing and age-verified dispatch. Built for adults who expect evidence — not hype.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-none px-8">
              <Link href="/c/e-liquids">Shop e-liquids <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-none border-foreground/15 bg-card px-8">
              <Link href="/guidance">New to vaping?</Link>
            </Button>
          </div>
          <TrustStrip className="mt-10" />
        </div>
      </section>

      {/* Persona routing */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionEyebrow>Who are you shopping for?</SectionEyebrow>
        <h2 className="font-display mt-2 text-2xl font-medium sm:text-3xl">One catalogue. Every vaper.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERSONAS.map((p) => (
            <SpotlightCard key={p.title} as={Link} href={p.href} className="flex flex-col p-5">
              <div className="mb-4 flex items-start justify-between">
                <span className="bg-accent text-pine rounded-none px-2.5 py-0.5 text-[10px] font-semibold uppercase">{p.tag}</span>
                <p.icon className="text-pine size-5 opacity-70" />
              </div>
              <h3 className="font-medium">{p.title}</h3>
              <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">{p.desc}</p>
              <span className="text-pine mt-4 inline-flex items-center gap-1 text-sm font-medium group-hover:underline">
                {p.cta} <ArrowRight className="size-3.5" />
              </span>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* Category gateway — single grid, no duplicate pills */}
      <section className="phx-section-sunken border-border border-y py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionEyebrow>Shop by category</SectionEyebrow>
          <h2 className="font-display mt-2 text-2xl font-medium sm:text-3xl">Browse the catalogue</h2>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm">Seven product families — duty-inclusive, batch-tested, spec-rich.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {CATEGORIES.map((c) => (
              <CategoryTile key={c.slug} category={c} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured products — open layout, no nested box */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionEyebrow>Catalogue</SectionEyebrow>
            <h2 className="font-display mt-1 text-2xl font-medium sm:text-3xl">Popular right now</h2>
            <p className="text-muted-foreground mt-1 text-sm">Duty-inclusive · honest stock · full specs on every product page</p>
          </div>
          <Button asChild variant="outline" className="rounded-none">
            <Link href="/c/e-liquids">View all products <ArrowRight className="size-4" /></Link>
          </Button>
        </div>

        {items.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        ) : (
          <div className="phx-card mt-8 border-dashed py-16 text-center">
            <p className="text-muted-foreground text-sm">
              Our shelves are being stocked. Please check back soon — or{" "}
              <Link href="/register" className="text-pine font-medium hover:underline">create an account</Link>{" "}
              to be first to know.
            </p>
          </div>
        )}
      </section>

      {/* Guidance */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionEyebrow>New to vaping</SectionEyebrow>
        <h2 className="font-display mt-2 text-2xl font-medium sm:text-3xl">Not sure where to start?</h2>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm">Guided paths for switchers — calm, plain, evidence-based.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {GUIDES.map((g) => (
            <div key={g.title} className="phx-card flex flex-col p-5">
              <div className="mb-4 flex items-start justify-between">
                <span className="bg-accent text-pine rounded-none px-2.5 py-0.5 text-[11px] font-semibold">{g.tag}</span>
                <g.icon className="text-pine size-5" />
              </div>
              <h3 className="font-medium">{g.title}</h3>
              <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">{g.desc}</p>
              <Link href={g.href} className="text-pine mt-4 inline-flex items-center gap-1 text-sm font-medium hover:underline">
                Read guide <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Subscription band */}
      <section className="phx-section-sunken border-border border-y py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <SectionEyebrow>Subscribe & save</SectionEyebrow>
              <h2 className="font-display mt-2 text-2xl font-medium sm:text-3xl">Your usual order, on your schedule.</h2>
              <ul className="text-muted-foreground mt-6 space-y-3 text-sm">
                <li className="flex gap-2"><Sparkles className="text-primary mt-0.5 size-4 shrink-0" /> Save on every repeat order</li>
                <li className="flex gap-2"><RefreshCw className="text-primary mt-0.5 size-4 shrink-0" /> Pause, skip, or swap anytime — you stay in control</li>
                <li className="flex gap-2"><Truck className="text-primary mt-0.5 size-4 shrink-0" /> Pre-renewal reminder before each dispatch</li>
              </ul>
              <Button asChild className="mt-8 rounded-none px-6">
                <Link href="/c/e-liquids">Browse subscription-eligible products</Link>
              </Button>
            </div>
            <div className="phx-card p-6">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Subscriptions are the simplest way to never run out. Choose your cadence at checkout on eligible products. Manage everything from your account — no phone calls, no hassle.
              </p>
              <p className="text-pine mt-4 text-xs font-medium">Subscriptions are coming soon — create an account and we&apos;ll let you know the moment they launch.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Evidence */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="text-center">
          <SectionEyebrow>Our Standard</SectionEyebrow>
          <h2 className="font-display mt-2 text-2xl font-medium sm:text-3xl">Evidence-forward by design</h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-sm">Trust signals are primary content — not fine print.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {EVIDENCE.map((e) => (
            <Link key={e.title} href={e.href} className="phx-card p-6 text-center">
              <h3 className="font-medium">{e.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{e.desc}</p>
              <span className="text-pine mt-4 inline-block text-xs font-medium">Learn more →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="phx-section-sunken border-border border-y py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionEyebrow>How it works</SectionEyebrow>
          <h2 className="font-display mt-2 text-2xl font-medium">Verify, dispatch, deliver — transparently</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p) => (
              <div key={p.step} className="phx-card p-5">
                <span className="font-mono text-pine text-xs font-medium">{p.step}</span>
                <h3 className="mt-2 font-medium">{p.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionEyebrow>Common questions</SectionEyebrow>
        <h2 className="font-display mt-2 text-2xl font-medium">Before you order</h2>
        <div className="mt-8 space-y-4">
          {FAQ.map((f) => (
            <details key={f.q} className="phx-card group p-5">
              <summary className="cursor-pointer list-none font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                {f.q}
              </summary>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Dark CTA */}
      <section className="phx-dark-band py-16 text-center">
        <h2 className="font-display text-2xl font-medium sm:text-3xl">Ready for your first order?</h2>
        <p className="phx-dark-band-muted mx-auto mt-3 max-w-md text-sm">
          Browse the full catalogue — duty-inclusive, age-verified, delivered tracked.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-none px-8">
            <Link href="/c/e-liquids">Shop now</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-chrome-fg/25 text-chrome-fg hover:bg-white/10 rounded-none bg-transparent px-8">
            <Link href="/register">Create account</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
