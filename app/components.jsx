import {
  BadgeCheck,
  ChevronRight,
  Clock3,
  CreditCard,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Truck,
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

export function Badge({ children, tone = "dark" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em]",
        tone === "green" && "bg-brand text-white",
        tone === "lime" && "bg-lime text-[#2C3132]",
        tone === "dark" && "bg-[#2C3132] text-white",
        tone === "soft" && "bg-[#ecf5df] text-[#2C3132]",
      )}
    >
      {children}
    </span>
  );
}

export function ButtonLink({ href, children, variant = "primary", className }) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-black transition",
        variant === "primary" && "bg-brand text-white shadow-lg shadow-emerald-900/15 hover:bg-[#08763d]",
        variant === "dark" && "bg-[#2C3132] text-white hover:bg-black",
        variant === "outline" && "border border-[#2C3132]/15 bg-white text-[#2C3132] hover:border-brand hover:text-brand",
        variant === "lime" && "bg-lime text-[#2C3132] hover:brightness-95",
        className,
      )}
      href={href}
    >
      {children}
    </Link>
  );
}

export function AnnouncementBar() {
  return (
    <div className="bg-[#2C3132] text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-2 text-center text-xs font-bold sm:justify-between">
        <span className="inline-flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-lime" /> Adults 18+ only
        </span>
        <span className="inline-flex items-center gap-2">
          <Truck className="h-4 w-4 text-lime" /> Free Royal Mail Tracked 24 over £30
        </span>
        <Link className="font-black text-lime hover:text-white" href="/safety">
          Compliance standards
        </Link>
      </div>
    </div>
  );
}

export function BrandMark({ compact = false }) {
  return (
    <Link className="flex items-center gap-3" href="/" aria-label="Phoenix Vapers home">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand to-lime text-lg font-black tracking-tighter text-white shadow-xl shadow-emerald-900/20">
        PV
      </span>
      {!compact ? (
        <span className="leading-tight">
          <strong className="block text-base font-black tracking-tight text-[#2C3132]">
            Phoenix Vapers
          </strong>
          <small className="block text-xs font-bold text-muted">
            Regulated UK vape retail
          </small>
        </span>
      ) : null}
    </Link>
  );
}

export function SiteHeader() {
  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-50 border-b border-[#2C3132]/10 bg-white/85 backdrop-blur-2xl">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-4 px-4 py-4 lg:grid-cols-[auto_1fr_auto]">
          <BrandMark />

          <nav className="flex flex-wrap items-center justify-start gap-2 lg:justify-center" aria-label="Primary navigation">
            {siteNav.map((item) => (
              <Link
                key={item.label}
                className="rounded-full px-3 py-2 text-sm font-black text-muted transition hover:bg-[#ecf5df] hover:text-[#2C3132]"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              className="hidden min-h-11 items-center gap-2 rounded-full border border-[#2C3132]/10 bg-white px-4 text-sm font-black text-[#2C3132] shadow-sm transition hover:border-brand hover:text-brand sm:inline-flex"
              href="/shop"
            >
              <Search className="h-4 w-4" /> Search
            </Link>
            <ButtonLink href="/cart" variant="dark">
              <ShoppingBag className="mr-2 h-4 w-4" /> Cart
            </ButtonLink>
          </div>
        </div>

        <div className="hidden border-t border-[#2C3132]/10 bg-[#f8faf3]/90 lg:block">
          <div className="mx-auto grid max-w-7xl grid-cols-4 gap-3 px-4 py-3">
            {categoryCards.map((category) => (
              <Link
                key={category.slug}
                className="group rounded-2xl border border-transparent px-4 py-3 transition hover:border-brand/20 hover:bg-white"
                href={`/${category.slug}`}
              >
                <span className="text-xs font-black uppercase tracking-[0.16em] text-brand">
                  {category.count}
                </span>
                <strong className="mt-1 block text-sm font-black text-[#2C3132]">
                  {category.title}
                </strong>
              </Link>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[#2C3132]/10 bg-[#2C3132] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
        <div>
          <BrandMark />
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">
            Enterprise-grade frontend for Phoenix Vapers: regulated vape retail,
            UK delivery, loyalty, product discovery, and age-aware checkout.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone="lime">18+ retail</Badge>
            <Badge tone="green">UK made e-liquids</Badge>
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
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-sm font-black uppercase tracking-[0.18em] text-lime">{title}</h3>
      <div className="mt-4 grid gap-2">
        {links.map((item) => (
          <Link key={item.label} className="text-sm text-white/70 transition hover:text-white" href={item.href}>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

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

export function SectionHeader({ eyebrow, title, text, action, href, align = "between" }) {
  return (
    <div
      className={cn(
        "mb-8 flex gap-5",
        align === "center" ? "mx-auto max-w-3xl flex-col text-center" : "flex-col lg:flex-row lg:items-end lg:justify-between",
      )}
    >
      <div className={cn(align === "center" ? "" : "max-w-3xl")}>
        {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.2em] text-brand">{eyebrow}</p> : null}
        <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#2C3132] md:text-5xl">
          {title}
        </h2>
        {text ? <p className="mt-4 text-base leading-8 text-muted">{text}</p> : null}
      </div>
      {action && href ? <ButtonLink href={href} variant="outline">{action}</ButtonLink> : null}
    </div>
  );
}

export function ProductCard({ product, elevated = false }) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-[2rem] border border-[#2C3132]/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/10",
        elevated && "shadow-2xl shadow-emerald-950/10",
      )}
    >
      <Link
        className="relative block min-h-64 overflow-hidden bg-gradient-to-br from-[#203032] via-[#0CA252] to-[#AECC53] p-5 text-white"
        href={`/product/${product.slug}`}
      >
        <div className="absolute right-[-5rem] top-[-5rem] h-48 w-48 rounded-full border border-white/25" />
        <Badge tone="lime">{product.badge}</Badge>
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
          <span className="text-6xl font-black tracking-[-0.12em] opacity-95">
            {product.brand.slice(0, 2).toUpperCase()}
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black backdrop-blur">
            {product.format}
          </span>
        </div>
      </Link>

      <div className="grid gap-4 p-5">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.14em] text-muted">
          <span>{product.brand}</span>
          <span className="inline-flex items-center gap-1 text-[#2C3132]">
            <Star className="h-3.5 w-3.5 fill-lime text-lime" /> {product.rating}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-black leading-tight tracking-[-0.03em] text-[#2C3132]">
            <Link href={`/product/${product.slug}`}>{product.name}</Link>
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{product.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.notes.map((note) => (
            <span key={note} className="rounded-full bg-[#ecf5df] px-3 py-1 text-xs font-black text-[#2C3132]">
              {note}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-[#2C3132]/10 pt-4">
          <div>
            <strong className="block text-2xl font-black tracking-[-0.05em] text-[#2C3132]">
              £{product.price.toFixed(2)}
            </strong>
            {product.compareAt ? (
              <small className="font-bold text-muted line-through">£{product.compareAt.toFixed(2)}</small>
            ) : null}
          </div>
          <ButtonLink href="/cart" variant="dark" className="px-4">
            Add
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, className }) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}

export function CategoryTile({ category }) {
  return (
    <Link
      className="group relative overflow-hidden rounded-[2rem] border border-[#2C3132]/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/10"
      href={`/${category.slug}`}
    >
      <div className="absolute right-[-4rem] top-[-4rem] h-32 w-32 rounded-full bg-lime/25 transition group-hover:scale-125" />
      <span className="text-xs font-black uppercase tracking-[0.18em] text-brand">{category.count}</span>
      <h3 className="mt-14 text-2xl font-black tracking-[-0.05em] text-[#2C3132]">{category.title}</h3>
      <p className="mt-3 text-sm leading-7 text-muted">{category.description}</p>
      <strong className="mt-5 inline-flex items-center gap-2 text-sm font-black text-brand">
        {category.accent} <ChevronRight className="h-4 w-4" />
      </strong>
    </Link>
  );
}

export function StatsGrid({ stats }) {
  if (!stats?.length) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(([value, label]) => (
        <article key={`${value}-${label}`} className="rounded-3xl border border-[#2C3132]/10 bg-white/80 p-5">
          <strong className="block text-2xl font-black tracking-[-0.06em] text-[#2C3132]">{value}</strong>
          <span className="mt-1 block text-sm font-bold text-muted">{label}</span>
        </article>
      ))}
    </div>
  );
}

export function TrustRail() {
  const items = [
    ["Age verified checkout", UserCheck],
    ["Batch-tested e-liquids", BadgeCheck],
    ["Tracked UK delivery", Truck],
    ["Secure payment ready", CreditCard],
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([label, Icon]) => (
        <article key={label} className="flex items-center gap-3 rounded-3xl border border-[#2C3132]/10 bg-white p-4 shadow-sm">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#ecf5df] text-brand">
            <Icon className="h-5 w-5" />
          </span>
          <strong className="text-sm font-black text-[#2C3132]">{label}</strong>
        </article>
      ))}
    </div>
  );
}

export function PromoStrip() {
  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid gap-3 rounded-[2rem] bg-[#2C3132] p-3 text-white md:grid-cols-4">
        {merchandisingHighlights.map((item) => (
          <span key={item} className="flex items-center gap-2 rounded-3xl px-4 py-3 text-sm font-black">
            <Sparkles className="h-4 w-4 text-lime" /> {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function FilterPanel() {
  const filters = [
    "Nic Salts",
    "Shortfills",
    "Starter Kits",
    "MTL",
    "DTL",
    "0mg",
    "10mg",
    "20mg",
    "Under £10",
    "Deals",
  ];

  return (
    <aside className="rounded-[2rem] border border-[#2C3132]/10 bg-white p-5 shadow-sm lg:sticky lg:top-36">
      <div className="flex items-center justify-between">
        <strong className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-[#2C3132]">
          <SlidersHorizontal className="h-4 w-4 text-brand" /> Filters
        </strong>
        <span className="rounded-full bg-[#ecf5df] px-3 py-1 text-xs font-black text-brand">3 active</span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            className="rounded-full border border-[#2C3132]/10 bg-[#f8faf3] px-3 py-2 text-xs font-black text-[#2C3132] transition hover:border-brand hover:text-brand"
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>
    </aside>
  );
}

export function NewsletterPanel() {
  return (
    <section className="mx-auto mt-16 max-w-7xl px-4">
      <div className="grid gap-8 rounded-[2.5rem] border border-[#2C3132]/10 bg-white p-6 shadow-2xl shadow-emerald-950/10 lg:grid-cols-[1fr_0.9fr] lg:p-10">
        <div>
          <Badge tone="green">Retention</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-[#2C3132] md:text-5xl">
            New drops, bundle pricing, and loyalty campaigns.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-muted">
            Enterprise ecommerce is not only homepage polish. It needs retention
            loops, launch messaging, repeat-purchase journeys, and compliant consent.
          </p>
        </div>
        <form className="grid content-center gap-3">
          <label className="text-sm font-black text-[#2C3132]" htmlFor="newsletter-email">
            Email address
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="min-h-12 flex-1 rounded-full border border-[#2C3132]/10 px-5 outline-none ring-brand/20 transition focus:ring-4"
              id="newsletter-email"
              type="email"
              placeholder="you@example.com"
            />
            <button className="min-h-12 rounded-full bg-brand px-6 text-sm font-black text-white" type="submit">
              Subscribe
            </button>
          </div>
          <p className="text-xs leading-6 text-muted">
            By subscribing, customers agree to receive Phoenix Vapers marketing
            and can unsubscribe at any time.
          </p>
        </form>
      </div>
    </section>
  );
}

export const commerceTrust = [
  { title: "Age Verification", text: "Designed for API-based age checks such as AgeChecked, 1account, or AgeVerifyUK.", icon: UserCheck },
  { title: "Delivery Promise", text: "Royal Mail Tracked 24/48 messaging and free delivery threshold surfaced early.", icon: PackageCheck },
  { title: "Compliance Layer", text: "18+ notices, nicotine warnings, batch testing, and EL-Science trust content throughout.", icon: ShieldCheck },
  { title: "Support Ready", text: "Live chat, phone, email, returns, and store assistance remain visible in shopping flows.", icon: Clock3 },
  { title: "Retail Footprint", text: "Store finder architecture is ready for postcode search and branch availability.", icon: MapPin },
];
