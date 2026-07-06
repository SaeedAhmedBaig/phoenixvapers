import {
  ChevronRight,
  Clock3,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { cn } from "./lib/utils";
import {
  categoryCards,
  footerLinks,
  merchandisingHighlights,
  siteNav,
  supportLinks,
} from "./siteData";
import { Badge } from "./ui";
import { NewsletterForm, SiteHeader } from "./interactive";

export function StoreShell({ children }) {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      {children}
      <NewsletterPanel />
      <SiteFooter />
    </main>
  );
}

function BrandMark() {
  return (
    <Link className="flex items-center gap-3" href="/" aria-label="Phoenix Vapers home">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand to-lime text-base font-black tracking-tighter text-white shadow-lg shadow-brand/25">
        PV
      </span>
      <span className="leading-tight">
        <strong className="block text-base font-black tracking-tight text-white">Phoenix Vapers</strong>
        <small className="block text-xs font-bold text-white/60">Regulated UK vape retail</small>
      </span>
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
        <div>
          <BrandMark />
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">
            Regulated UK vape retail: UK-made e-liquids, authentic hardware, coils, CBD, loyalty
            rewards, tracked delivery, and age-aware checkout.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone="lime">18+ retail</Badge>
            <Badge tone="brand">UK made e-liquids</Badge>
          </div>
        </div>

        <FooterColumn title="Shop" links={siteNav} />
        <FooterColumn title="Company" links={footerLinks} />

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-lime">Support</h3>
          <div className="mt-4 grid gap-2 text-sm text-white/70">
            {supportLinks.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs font-bold text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Phoenix Vapers Limited. Nicotine is addictive.</span>
          <span>Peterborough, United Kingdom · GBP · UK VAT included</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-sm font-black uppercase tracking-[0.18em] text-lime">{title}</h3>
      <div className="mt-4 grid gap-2">
        {links.map((item) => (
          <Link
            key={item.label}
            className="text-sm text-white/70 transition hover:text-white"
            href={item.href}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CategoryTile({ category }) {
  return (
    <Link
      className="group relative overflow-hidden rounded-4xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand/25 hover:shadow-2xl hover:shadow-brand/10"
      href={`/${category.slug}`}
    >
      <div className="absolute right-[-4rem] top-[-4rem] h-32 w-32 rounded-full bg-lime/25 transition group-hover:scale-125" />
      <span className="relative text-xs font-black uppercase tracking-[0.18em] text-brand">
        {category.count}
      </span>
      <h3 className="relative mt-14 text-2xl font-black tracking-[-0.05em] text-ink">{category.title}</h3>
      <p className="relative mt-3 text-sm leading-7 text-muted">{category.description}</p>
      <strong className="relative mt-5 inline-flex items-center gap-2 text-sm font-black text-brand">
        {category.accent} <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </strong>
    </Link>
  );
}

export function TrustRail() {
  const items = [
    ["Age verified checkout", UserCheck],
    ["Batch-tested e-liquids", ShieldCheck],
    ["Tracked UK delivery", PackageCheck],
    ["Secure payment ready", ShieldCheck],
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([label, Icon]) => (
        <article
          key={label}
          className="flex items-center gap-3 rounded-3xl border border-line bg-white p-4 shadow-sm"
        >
          <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-soft text-brand">
            <Icon className="h-5 w-5" />
          </span>
          <strong className="text-sm font-black text-ink">{label}</strong>
        </article>
      ))}
    </div>
  );
}

export function PromoStrip() {
  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid gap-1 rounded-4xl bg-ink p-3 text-white md:grid-cols-4">
        {merchandisingHighlights.map((item) => (
          <span key={item} className="flex items-center gap-2 rounded-3xl px-4 py-3 text-sm font-black">
            <Sparkles className="h-4 w-4 flex-none text-lime" /> {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function NewsletterPanel() {
  return (
    <section className="mx-auto mt-16 max-w-7xl px-4">
      <div className="grid gap-8 rounded-5xl border border-line bg-white p-6 shadow-2xl shadow-brand/5 lg:grid-cols-[1fr_0.9fr] lg:p-10">
        <div>
          <Badge tone="brand">Retention</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-ink md:text-5xl">
            New drops, bundle pricing, and loyalty campaigns.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-muted">
            Get launch messaging, repeat-purchase offers, and members-only bundle pricing — with
            compliant consent and easy unsubscribe.
          </p>
        </div>
        <NewsletterForm />
      </div>
    </section>
  );
}

export const commerceTrust = [
  {
    title: "Age Verification",
    text: "Designed for API-based age checks such as AgeChecked, 1account, or AgeVerifyUK.",
    icon: UserCheck,
  },
  {
    title: "Delivery Promise",
    text: "Royal Mail Tracked 24/48 messaging and free delivery threshold surfaced early.",
    icon: PackageCheck,
  },
  {
    title: "Compliance Layer",
    text: "18+ notices, nicotine warnings, batch testing, and EL-Science trust content throughout.",
    icon: ShieldCheck,
  },
  {
    title: "Support Ready",
    text: "Live chat, phone, email, returns, and store assistance remain visible in shopping flows.",
    icon: Clock3,
  },
  {
    title: "Retail Footprint",
    text: "Store finder architecture is ready for postcode search and branch availability.",
    icon: MapPin,
  },
];
