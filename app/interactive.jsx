"use client";

import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  CreditCard,
  Filter,
  Gift,
  Loader2,
  LockKeyhole,
  Menu,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  UserCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { categoryCards, siteNav } from "./siteData";
import { useAge, useCart } from "./lib/store";
import {
  cn,
  categoryGradient,
  formatGBP,
  FREE_SHIPPING_THRESHOLD,
  strengthOptions,
} from "./lib/utils";
import { Badge, buttonClasses, Rating } from "./ui";

/* -------------------------------------------------------------------------- */
/*  Product visual + cards                                                      */
/* -------------------------------------------------------------------------- */

export function ProductVisual({ product, className, size = "text-6xl" }) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden bg-gradient-to-br p-5 text-white",
        categoryGradient(product.category),
        className,
      )}
    >
      <div className="pointer-events-none absolute right-[-4.5rem] top-[-4.5rem] h-44 w-44 rounded-full border border-white/20" />
      <div className="pointer-events-none absolute left-[-3rem] bottom-[-3rem] h-32 w-32 rounded-full bg-white/10 blur-xl" />
      <div className="relative flex items-start justify-between">
        {product.badge ? <Badge tone="lime">{product.badge}</Badge> : <span />}
        {product.stock === "low" ? (
          <span className="rounded-full bg-accent/90 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-wide">
            Low stock
          </span>
        ) : null}
      </div>
      <div className="relative flex items-end justify-between">
        <span className={cn("font-black tracking-[-0.12em] opacity-95", size)}>
          {product.brand.slice(0, 2).toUpperCase()}
        </span>
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black backdrop-blur">
          {product.format}
        </span>
      </div>
    </div>
  );
}

export function ProductCard({ product }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-4xl border border-line bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-2xl hover:shadow-brand/10">
      <Link
        className="relative block min-h-56"
        href={`/product/${product.slug}`}
        aria-label={product.name}
      >
        <ProductVisual product={product} className="min-h-56" />
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.14em] text-muted">
          <span className="truncate">{product.brand}</span>
          <Rating value={product.rating} />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-black leading-tight tracking-[-0.03em] text-ink">
            <Link className="transition hover:text-brand" href={`/product/${product.slug}`}>
              {product.name}
            </Link>
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{product.description}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {product.notes.map((note) => (
            <span key={note} className="rounded-full bg-soft px-2.5 py-1 text-xs font-black text-ink">
              {note}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-line pt-4">
          <div>
            <strong className="block text-2xl font-black tracking-[-0.05em] text-ink">
              {formatGBP(product.price)}
            </strong>
            {product.compareAt ? (
              <small className="font-bold text-muted line-through">
                {formatGBP(product.compareAt)}
              </small>
            ) : null}
          </div>
          <AddToCartButton product={product} compact />
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

/* -------------------------------------------------------------------------- */
/*  Add to cart + quantity                                                      */
/* -------------------------------------------------------------------------- */

export function AddToCartButton({ product, strength, qty = 1, variant = "dark", compact = false, className, label = "Add" }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function onClick() {
    addItem(product, { strength, qty });
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={buttonClasses(variant, cn(compact ? "px-4" : "", className))}
      aria-label={`Add ${product.name} to basket`}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" /> Added
        </>
      ) : (
        <>
          {!compact ? <ShoppingBag className="h-4 w-4" /> : null}
          {compact ? "Add" : label}
        </>
      )}
    </button>
  );
}

export function QuantityStepper({ value, onChange, min = 1, className }) {
  return (
    <div className={cn("inline-flex items-center rounded-full border border-line bg-white", className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="grid h-9 w-9 place-items-center rounded-full text-ink transition hover:bg-soft disabled:opacity-40"
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-8 text-center text-sm font-black text-ink" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="grid h-9 w-9 place-items-center rounded-full text-ink transition hover:bg-soft"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Product purchase panel (PDP)                                                */
/* -------------------------------------------------------------------------- */

export function ProductPurchasePanel({ product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const options = strengthOptions(product.strength);
  const hasChoices = options.length > 1;
  const [selected, setSelected] = useState(options[0] ?? product.strength);
  const [qty, setQty] = useState(1);

  function buyNow() {
    addItem(product, { strength: selected, qty });
    router.push("/checkout");
  }

  return (
    <div className="mt-6 rounded-4xl border border-line bg-soft p-5">
      {hasChoices ? (
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ink">
            {product.category === "coils" ? "Resistance" : "Nicotine strength"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSelected(option)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-black transition",
                  selected === option
                    ? "border-brand bg-brand text-white"
                    : "border-ink/15 bg-white text-ink hover:border-brand hover:text-brand",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <strong className="block text-5xl font-black tracking-[-0.08em] text-ink">
            {formatGBP(product.price)}
          </strong>
          {product.compareAt ? (
            <small className="font-bold text-muted line-through">
              Was {formatGBP(product.compareAt)}
            </small>
          ) : null}
        </div>
        <QuantityStepper value={qty} onChange={setQty} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <AddToCartButton
          product={product}
          strength={selected}
          qty={qty}
          variant="primary"
          label="Add to basket"
          className="w-full"
        />
        <button type="button" onClick={buyNow} className={buttonClasses("dark", "w-full")}>
          Buy now <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-3 text-sm font-bold text-ink md:grid-cols-3">
        <span className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-brand" /> Free over £30
        </span>
        <span className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-brand" /> Age verified
        </span>
        <span className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-brand" /> Points eligible
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Header                                                                      */
/* -------------------------------------------------------------------------- */

export function AnnouncementBar() {
  return (
    <div className="bg-ink text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4 py-2 text-center text-xs font-bold sm:justify-between">
        <span className="inline-flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-lime" /> Adults 18+ only
        </span>
        <span className="hidden items-center gap-2 sm:inline-flex">
          <Truck className="h-4 w-4 text-lime" /> Free Royal Mail Tracked 24 over £30
        </span>
        <Link className="font-black text-lime transition hover:text-white" href="/safety">
          Compliance standards
        </Link>
      </div>
    </div>
  );
}

function BrandMark({ compact = false }) {
  return (
    <Link className="flex items-center gap-3" href="/" aria-label="Phoenix Vapers home">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand to-lime text-base font-black tracking-tighter text-white shadow-lg shadow-brand/25">
        PV
      </span>
      {!compact ? (
        <span className="leading-tight">
          <strong className="block text-base font-black tracking-tight text-ink">
            Phoenix Vapers
          </strong>
          <small className="block text-xs font-bold text-muted">Regulated UK vape retail</small>
        </span>
      ) : null}
    </Link>
  );
}

export function SiteHeader() {
  const { count, openDrawer, ready } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3.5">
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-2xl border border-line text-ink lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <BrandMark />

          <nav
            className="mx-auto hidden items-center gap-1 lg:flex"
            aria-label="Primary navigation"
          >
            {siteNav.map((item) => (
              <Link
                key={item.label}
                className="rounded-full px-3 py-2 text-sm font-black text-muted transition hover:bg-soft hover:text-ink"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-line text-ink transition hover:border-brand hover:text-brand sm:hidden"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-black text-ink shadow-sm transition hover:border-brand hover:text-brand sm:inline-flex"
            >
              <Search className="h-4 w-4" /> Search products
            </button>
            <button
              type="button"
              onClick={openDrawer}
              className={buttonClasses("dark", "relative px-4")}
              aria-label="Open basket"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Basket</span>
              {ready && count > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-lime px-1 text-[0.7rem] font-black text-ink">
                  {count}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <div className="hidden border-t border-line bg-cream/60 lg:block">
          <div className="mx-auto grid max-w-7xl grid-cols-4 gap-3 px-4 py-2.5">
            {categoryCards.map((category) => (
              <Link
                key={category.slug}
                className="group flex items-center justify-between rounded-2xl border border-transparent px-4 py-2 transition hover:border-brand/20 hover:bg-white"
                href={`/${category.slug}`}
              >
                <span>
                  <span className="block text-[0.7rem] font-black uppercase tracking-[0.16em] text-brand">
                    {category.count}
                  </span>
                  <strong className="block text-sm font-black text-ink">{category.title}</strong>
                </span>
                <ChevronRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand" />
              </Link>
            ))}
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function MobileMenu({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-ink/50 pv-fade-in" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-white p-5 shadow-2xl pv-slide-in">
        <div className="flex items-center justify-between">
          <BrandMark />
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-line text-ink"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-6 grid gap-1">
          {siteNav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-base font-black text-ink transition hover:bg-soft"
            >
              {item.label}
              <ChevronRight className="h-4 w-4 text-muted" />
            </Link>
          ))}
        </nav>
        <div className="mt-6 rounded-3xl bg-soft p-4 text-sm font-bold leading-6 text-ink">
          <UserCheck className="mb-2 h-5 w-5 text-brand" />
          Age-verified 18+ retail. Free Royal Mail Tracked 24 over £30.
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Search overlay                                                              */
/* -------------------------------------------------------------------------- */

export function SearchOverlay({ open, onClose, products = [] }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  // Products are provided globally via a data island to keep search client-side.
  const allProducts = products.length ? products : GLOBAL_PRODUCTS;

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allProducts
      .filter((p) =>
        [p.name, p.brand, p.category, p.flavour, p.format]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q)),
      )
      .slice(0, 6);
  }, [query, allProducts]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/50 pv-fade-in" onClick={onClose} />
      <div className="absolute inset-x-0 top-0 mx-auto max-w-2xl px-4 pt-20 pv-scale-in">
        <div className="overflow-hidden rounded-4xl border border-line bg-white shadow-2xl">
          <div className="flex items-center gap-3 border-b border-line px-5">
            <Search className="h-5 w-5 text-muted" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search e-liquids, kits, coils, CBD…"
              className="min-h-14 flex-1 bg-transparent text-base font-bold text-ink outline-none placeholder:text-muted"
            />
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-soft"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {query && results.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm font-bold text-muted">
                No products match “{query}”. Try a flavour, brand, or format.
              </p>
            ) : null}
            {results.map((p) => (
              <Link
                key={p.slug}
                href={`/product/${p.slug}`}
                onClick={onClose}
                className="flex items-center gap-4 rounded-2xl px-3 py-2.5 transition hover:bg-soft"
              >
                <ProductVisual product={p} className="h-14 w-14 rounded-2xl p-2" size="text-lg" />
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-black text-ink">{p.name}</strong>
                  <span className="text-xs font-bold text-muted">
                    {p.brand} · {p.format}
                  </span>
                </span>
                <strong className="text-sm font-black text-ink">{formatGBP(p.price)}</strong>
              </Link>
            ))}
            {!query ? (
              <div className="px-4 py-6">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                  Popular searches
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Nic salts", "Shortfills", "Pod kits", "Coils", "CBD", "4 for £11"].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term.split(" ")[0])}
                      className="rounded-full border border-line bg-cream px-3 py-1.5 text-xs font-black text-ink transition hover:border-brand hover:text-brand"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

// Populated once on the client so the header search can run without prop drilling.
let GLOBAL_PRODUCTS = [];
export function ProductDataIsland({ products }) {
  GLOBAL_PRODUCTS = products;
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Mini cart drawer                                                            */
/* -------------------------------------------------------------------------- */

export function MiniCartDrawer() {
  const {
    items,
    drawerOpen,
    closeDrawer,
    updateQty,
    removeItem,
    subtotal,
    remaining,
    progress,
    qualifiesForFreeShipping,
    count,
  } = useCart();

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") closeDrawer();
    }
    if (drawerOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/50 pv-fade-in" onClick={closeDrawer} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl pv-slide-in">
        <div className="flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <strong className="flex items-center gap-2 text-lg font-black text-ink">
            <ShoppingBag className="h-5 w-5 text-brand" /> Your basket
            <span className="text-muted">({count})</span>
          </strong>
          <button
            type="button"
            onClick={closeDrawer}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-line text-ink"
            aria-label="Close basket"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-3xl bg-soft text-brand">
              <ShoppingBag className="h-7 w-7" />
            </span>
            <p className="text-lg font-black text-ink">Your basket is empty</p>
            <p className="text-sm font-bold text-muted">
              Add e-liquids, kits, or coils to get started.
            </p>
            <button type="button" onClick={closeDrawer} className={buttonClasses("primary")}>
              Start shopping
            </button>
          </div>
        ) : (
          <>
            <div className="border-b border-line bg-white px-5 py-3">
              <ShippingProgress
                remaining={remaining}
                progress={progress}
                qualifies={qualifiesForFreeShipping}
              />
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="grid gap-3">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="grid grid-cols-[4rem_1fr_auto] items-center gap-3 rounded-3xl border border-line bg-white p-3"
                  >
                    <div className={cn("grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br text-lg font-black text-white", categoryGradient(item.category))}>
                      {item.brand.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <strong className="block truncate text-sm font-black text-ink">
                        {item.name}
                      </strong>
                      <span className="text-xs font-bold text-muted">
                        {item.strength ? `${item.strength} · ` : ""}
                        {formatGBP(item.price)}
                      </span>
                      <div className="mt-2">
                        <QuantityStepper
                          value={item.qty}
                          onChange={(q) => updateQty(item.id, q)}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <strong className="text-sm font-black text-ink">
                        {formatGBP(item.price * item.qty)}
                      </strong>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-muted transition hover:text-accent"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="border-t border-line bg-white px-5 py-4">
              <div className="flex items-center justify-between text-sm font-bold text-muted">
                <span>Subtotal</span>
                <strong className="text-lg font-black text-ink">{formatGBP(subtotal)}</strong>
              </div>
              <p className="mt-1 text-xs font-bold text-muted">
                Delivery and loyalty points shown at checkout.
              </p>
              <div className="mt-4 grid gap-2">
                <Link href="/checkout" onClick={closeDrawer} className={buttonClasses("primary", "w-full")}>
                  Checkout <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/cart" onClick={closeDrawer} className={buttonClasses("outline", "w-full")}>
                  View basket
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function ShippingProgress({ remaining, progress, qualifies }) {
  return (
    <div>
      <p className="text-sm font-bold text-ink">
        {qualifies ? (
          <span className="inline-flex items-center gap-1.5 text-brand">
            <BadgeCheck className="h-4 w-4" /> Free Tracked 24 unlocked
          </span>
        ) : (
          <>
            Add <strong>{formatGBP(remaining)}</strong> for free Tracked 24
          </>
        )}
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-soft">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-lime transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Age gate                                                                    */
/* -------------------------------------------------------------------------- */

export function AgeGate() {
  const { verified, ready, confirm } = useAge();
  const [declined, setDeclined] = useState(false);

  if (!ready || verified) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm pv-fade-in" />
      <div className="relative w-full max-w-md overflow-hidden rounded-4xl bg-white shadow-2xl pv-scale-in">
        <div className="bg-gradient-to-br from-ink to-[#101617] px-6 py-8 text-center text-white">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/10">
            <UserCheck className="h-7 w-7 text-lime" />
          </span>
          <h2 className="mt-4 text-2xl font-black tracking-[-0.04em]">Are you 18 or over?</h2>
          <p className="mt-2 text-sm leading-6 text-white/70">
            Phoenix Vapers sells age-restricted nicotine products. You must confirm you are 18+ to
            enter this shop.
          </p>
        </div>
        <div className="p-6">
          {declined ? (
            <div className="rounded-3xl bg-soft p-5 text-center">
              <p className="text-sm font-bold leading-6 text-ink">
                You must be 18 or over to shop with Phoenix Vapers. Please close this page.
              </p>
              <button
                type="button"
                onClick={() => setDeclined(false)}
                className="mt-4 text-sm font-black text-brand underline"
              >
                Go back
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              <button type="button" onClick={confirm} className={buttonClasses("primary", "w-full")}>
                Yes, I am 18 or over
              </button>
              <button
                type="button"
                onClick={() => setDeclined(true)}
                className={buttonClasses("outline", "w-full")}
              >
                No, I am under 18
              </button>
              <p className="mt-1 text-center text-xs leading-5 text-muted">
                Nicotine is addictive. By entering you agree to our age policy and confirm you are a
                UK adult.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Product browser (faceted PLP)                                               */
/* -------------------------------------------------------------------------- */

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Top rated" },
];

function uniqueValues(products, key) {
  return [...new Set(products.map((p) => p[key]).filter(Boolean))].sort();
}

export function ProductBrowser({ products, heading = "All products" }) {
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState(new Set());
  const [flavour, setFlavour] = useState(new Set());
  const [brand, setBrand] = useState(new Set());
  const [onlyDeals, setOnlyDeals] = useState(false);
  const [sort, setSort] = useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const facets = useMemo(
    () => ({
      formats: uniqueValues(products, "format"),
      flavours: uniqueValues(products, "flavour"),
      brands: uniqueValues(products, "brand"),
    }),
    [products],
  );

  function toggle(setter) {
    return (value) =>
      setter((prev) => {
        const next = new Set(prev);
        next.has(value) ? next.delete(value) : next.add(value);
        return next;
      });
  }

  const activeCount =
    format.size + flavour.size + brand.size + (onlyDeals ? 1 : 0) + (query ? 1 : 0);

  function clearAll() {
    setQuery("");
    setFormat(new Set());
    setFlavour(new Set());
    setBrand(new Set());
    setOnlyDeals(false);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      if (format.size && !format.has(p.format)) return false;
      if (flavour.size && !flavour.has(p.flavour)) return false;
      if (brand.size && !brand.has(p.brand)) return false;
      if (onlyDeals && !p.compareAt) return false;
      if (q && ![p.name, p.brand, p.flavour, p.format].filter(Boolean).some((f) => f.toLowerCase().includes(q)))
        return false;
      return true;
    });

    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    return list;
  }, [products, format, flavour, brand, onlyDeals, query, sort]);

  const filterGroups = (
    <div className="grid gap-6">
      <div>
        <label className="text-xs font-black uppercase tracking-[0.16em] text-ink">Search</label>
        <div className="mt-2 flex items-center gap-2 rounded-full border border-line bg-cream px-4">
          <Search className="h-4 w-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Flavour, brand…"
            className="min-h-10 flex-1 bg-transparent text-sm font-bold text-ink outline-none placeholder:text-muted"
          />
        </div>
      </div>

      <FilterGroup title="Format" values={facets.formats} active={format} onToggle={toggle(setFormat)} />
      {facets.flavours.length ? (
        <FilterGroup title="Flavour" values={facets.flavours} active={flavour} onToggle={toggle(setFlavour)} />
      ) : null}
      <FilterGroup title="Brand" values={facets.brands} active={brand} onToggle={toggle(setBrand)} />

      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-cream p-3 text-sm font-black text-ink">
        <input
          type="checkbox"
          checked={onlyDeals}
          onChange={(e) => setOnlyDeals(e.target.checked)}
          className="h-4 w-4 accent-brand"
        />
        On offer only
      </label>
    </div>
  );

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[280px_1fr]">
      <aside className="hidden lg:block">
        <div className="rounded-4xl border border-line bg-white p-5 shadow-sm lg:sticky lg:top-40">
          <div className="mb-5 flex items-center justify-between">
            <strong className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-ink">
              <Filter className="h-4 w-4 text-brand" /> Filters
            </strong>
            {activeCount > 0 ? (
              <button type="button" onClick={clearAll} className="text-xs font-black text-brand">
                Clear ({activeCount})
              </button>
            ) : null}
          </div>
          {filterGroups}
        </div>
      </aside>

      <div>
        <div className="mb-5 flex flex-col gap-4 rounded-4xl border border-line bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand">{heading}</p>
            <h2 className="mt-0.5 text-xl font-black tracking-[-0.04em] text-ink">
              {filtered.length} {filtered.length === 1 ? "product" : "products"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className={buttonClasses("outline", "lg:hidden")}
            >
              <Filter className="h-4 w-4" /> Filters
              {activeCount > 0 ? <span className="text-brand">({activeCount})</span> : null}
            </button>
            <label className="sr-only" htmlFor="sort">
              Sort products
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="min-h-11 rounded-full border border-line bg-white px-4 text-sm font-black text-ink outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeCount > 0 ? (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {[...format, ...flavour, ...brand].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1 text-xs font-black text-ink"
              >
                {tag}
              </span>
            ))}
            {onlyDeals ? (
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-black text-accent">
                On offer
              </span>
            ) : null}
          </div>
        ) : null}

        {filtered.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-4xl border border-dashed border-line bg-white p-12 text-center">
            <p className="text-lg font-black text-ink">No products match your filters</p>
            <p className="mt-2 text-sm font-bold text-muted">Try clearing a filter or searching differently.</p>
            <button type="button" onClick={clearAll} className={buttonClasses("primary", "mt-4")}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50 pv-fade-in" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-4xl bg-white p-5 pv-scale-in">
            <div className="mb-5 flex items-center justify-between">
              <strong className="text-lg font-black text-ink">Filters</strong>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-line"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterGroups}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={clearAll} className={buttonClasses("outline")}>
                Clear
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className={buttonClasses("primary")}
              >
                Show {filtered.length}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function FilterGroup({ title, values, active, onToggle }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-ink">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onToggle(value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-black transition",
              active.has(value)
                ? "border-brand bg-brand text-white"
                : "border-line bg-cream text-ink hover:border-brand hover:text-brand",
            )}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Cart page view                                                              */
/* -------------------------------------------------------------------------- */

export function CartView() {
  const {
    items,
    updateQty,
    removeItem,
    subtotal,
    delivery,
    total,
    remaining,
    progress,
    qualifiesForFreeShipping,
    points,
  } = useCart();

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-4xl bg-soft text-brand">
          <ShoppingBag className="h-9 w-9" />
        </span>
        <h1 className="mt-6 text-3xl font-black tracking-[-0.05em] text-ink">Your basket is empty</h1>
        <p className="mt-3 text-base font-bold text-muted">
          Browse UK-made e-liquids, authentic hardware, coils, and CBD.
        </p>
        <Link href="/shop" className={buttonClasses("primary", "mt-6")}>
          Start shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_380px]">
      <div className="grid gap-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="grid gap-4 rounded-4xl border border-line bg-white p-4 shadow-sm sm:grid-cols-[6rem_1fr_auto] sm:items-center"
          >
            <Link
              href={`/product/${item.slug}`}
              className={cn(
                "grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br text-2xl font-black text-white",
                categoryGradient(item.category),
              )}
            >
              {item.brand.slice(0, 2).toUpperCase()}
            </Link>
            <div>
              {item.badge ? <Badge tone="soft">{item.badge}</Badge> : null}
              <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-ink">
                <Link className="hover:text-brand" href={`/product/${item.slug}`}>
                  {item.name}
                </Link>
              </h2>
              <p className="mt-1 text-sm font-bold text-muted">
                {item.format}
                {item.strength ? ` · ${item.strength}` : ""}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <QuantityStepper value={item.qty} onChange={(q) => updateQty(item.id, q)} />
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="inline-flex items-center gap-1.5 text-sm font-black text-muted transition hover:text-accent"
                >
                  <Trash2 className="h-4 w-4" /> Remove
                </button>
              </div>
            </div>
            <strong className="text-2xl font-black tracking-[-0.05em] text-ink">
              {formatGBP(item.price * item.qty)}
            </strong>
          </article>
        ))}
      </div>

      <aside className="rounded-4xl border border-line bg-white p-6 shadow-xl shadow-brand/5 lg:sticky lg:top-40 lg:self-start">
        <h2 className="text-2xl font-black tracking-[-0.05em] text-ink">Order summary</h2>
        <div className="mt-5 grid gap-3">
          <SummaryRow label="Subtotal" value={formatGBP(subtotal)} />
          <SummaryRow label="Tracked 24 delivery" value={delivery === 0 ? "Free" : formatGBP(delivery)} />
          <SummaryRow label="Loyalty points earned" value={`${points} pts`} />
          <div className="flex items-center justify-between pt-2">
            <span className="text-base font-black text-ink">Total</span>
            <strong className="text-2xl font-black tracking-[-0.05em] text-ink">{formatGBP(total)}</strong>
          </div>
        </div>

        <div className="mt-5">
          <ShippingProgress remaining={remaining} progress={progress} qualifies={qualifiesForFreeShipping} />
        </div>

        <div className="mt-5 grid gap-2 text-sm font-bold text-muted">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand" /> 18+ age verification required
          </span>
          <span className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-brand" /> Royal Mail tracked services
          </span>
        </div>

        <Link href="/checkout" className={buttonClasses("primary", "mt-6 w-full")}>
          Continue to checkout <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/shop" className="mt-3 block text-center text-sm font-black text-brand">
          Keep shopping
        </Link>
      </aside>
    </section>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-line pb-3">
      <span className="font-bold text-muted">{label}</span>
      <strong className="text-ink">{value}</strong>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Checkout flow                                                               */
/* -------------------------------------------------------------------------- */

const STEPS = ["Contact", "Delivery", "Age & review", "Payment"];

export function CheckoutFlow() {
  const router = useRouter();
  const { items, subtotal, delivery, total, points, clearCart } = useCart();
  const [step, setStep] = useState(0);
  const [placed, setPlaced] = useState(false);
  const [orderRef] = useState(() => `PV-${Math.floor(100000 + Math.random() * 900000)}`);
  const [form, setForm] = useState({
    email: "",
    phone: "",
    name: "",
    address: "",
    city: "",
    postcode: "",
    ageConfirm: false,
    card: "",
    expiry: "",
    cvc: "",
  });
  const [errors, setErrors] = useState({});

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(current) {
    const e = {};
    if (current === 0) {
      if (!form.email.includes("@")) e.email = "Enter a valid email";
      if (form.phone.trim().length < 7) e.phone = "Enter a phone number";
    }
    if (current === 1) {
      if (!form.name.trim()) e.name = "Required";
      if (!form.address.trim()) e.address = "Required";
      if (!form.city.trim()) e.city = "Required";
      if (form.postcode.trim().length < 5) e.postcode = "Enter a valid postcode";
    }
    if (current === 2 && !form.ageConfirm) e.ageConfirm = "You must confirm you are 18+";
    if (current === 3) {
      if (form.card.replace(/\s/g, "").length < 12) e.card = "Enter a card number";
      if (!/^\d{2}\s*\/\s*\d{2}$/.test(form.expiry)) e.expiry = "MM / YY";
      if (form.cvc.trim().length < 3) e.cvc = "3 digits";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validate(step)) setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function placeOrder() {
    if (!validate(3)) return;
    setPlaced(true);
    clearCart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (placed) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-4xl bg-brand text-white pv-scale-in">
          <Check className="h-10 w-10" />
        </span>
        <h1 className="mt-6 text-4xl font-black tracking-[-0.06em] text-ink">Order confirmed</h1>
        <p className="mt-3 text-base font-bold text-muted">
          Thank you. A confirmation email has been sent to {form.email || "your inbox"}.
        </p>
        <div className="mx-auto mt-6 max-w-sm rounded-4xl border border-line bg-white p-6 text-left shadow-sm">
          <SummaryRow label="Order reference" value={orderRef} />
          <SummaryRow label="Total paid" value={formatGBP(total)} />
          <div className="flex items-center justify-between pt-3">
            <span className="font-bold text-muted">Points earned</span>
            <strong className="text-brand">{points} pts</strong>
          </div>
        </div>
        <p className="mt-4 text-sm font-bold text-muted">
          Orders before 2pm Monday–Friday dispatch the same day via Royal Mail Tracked 24.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/shop" className={buttonClasses("primary")}>
            Continue shopping
          </Link>
          <Link href="/" className={buttonClasses("outline")}>
            Back home
          </Link>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-black tracking-[-0.05em] text-ink">Your basket is empty</h1>
        <p className="mt-3 text-base font-bold text-muted">Add products before checking out.</p>
        <Link href="/shop" className={buttonClasses("primary", "mt-6")}>
          Go to shop
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_390px]">
      <div>
        <ol className="mb-6 flex flex-wrap items-center gap-2">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black transition",
                  i === step && "bg-brand text-white",
                  i < step && "bg-soft text-ink",
                  i > step && "bg-white text-muted",
                )}
              >
                <span
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded-full text-[0.7rem]",
                    i <= step ? "bg-white/25" : "bg-soft",
                  )}
                >
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                {label}
              </button>
              {i < STEPS.length - 1 ? <ChevronRight className="h-4 w-4 text-muted" /> : null}
            </li>
          ))}
        </ol>

        <div className="rounded-4xl border border-line bg-white p-6 shadow-sm md:p-8">
          {step === 0 ? (
            <StepShell title="Contact details" subtitle="For order updates and delivery tracking.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email address" value={form.email} onChange={(v) => set("email", v)} error={errors.email} type="email" placeholder="you@example.com" />
                <Field label="Phone number" value={form.phone} onChange={(v) => set("phone", v)} error={errors.phone} type="tel" placeholder="01733 000000" />
              </div>
            </StepShell>
          ) : null}

          {step === 1 ? (
            <StepShell title="Delivery address" subtitle="UK delivery via Royal Mail tracked services.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" value={form.name} onChange={(v) => set("name", v)} error={errors.name} wide />
                <Field label="Address" value={form.address} onChange={(v) => set("address", v)} error={errors.address} wide placeholder="Street address" />
                <Field label="Town / City" value={form.city} onChange={(v) => set("city", v)} error={errors.city} />
                <Field label="Postcode" value={form.postcode} onChange={(v) => set("postcode", v)} error={errors.postcode} placeholder="PE1 5UH" />
              </div>
            </StepShell>
          ) : null}

          {step === 2 ? (
            <StepShell title="Age verification & review" subtitle="A recognised age-check provider is used before dispatch of restricted goods.">
              <label
                className={cn(
                  "flex items-start gap-3 rounded-3xl border p-5 text-sm font-bold leading-6 text-ink transition",
                  errors.ageConfirm ? "border-accent bg-accent/5" : "border-line bg-soft",
                )}
              >
                <input
                  type="checkbox"
                  checked={form.ageConfirm}
                  onChange={(e) => set("ageConfirm", e.target.checked)}
                  className="mt-0.5 h-5 w-5 accent-brand"
                />
                <span>
                  I confirm I am 18 or over and understand nicotine is addictive. I consent to age
                  verification via a provider such as AgeChecked or 1account before restricted goods
                  are dispatched.
                </span>
              </label>
              {errors.ageConfirm ? (
                <p className="mt-2 text-xs font-black text-accent">{errors.ageConfirm}</p>
              ) : null}

              <div className="mt-5 grid gap-2 rounded-3xl bg-cream p-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm font-bold text-ink">
                    <span className="truncate">
                      {item.qty} × {item.name}
                      {item.strength ? ` (${item.strength})` : ""}
                    </span>
                    <span>{formatGBP(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
            </StepShell>
          ) : null}

          {step === 3 ? (
            <StepShell title="Payment" subtitle="Card fields represent PCI-scoped hosted fields from the payment provider.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Card number" value={form.card} onChange={(v) => set("card", v)} error={errors.card} placeholder="4242 4242 4242 4242" wide />
                <Field label="Expiry" value={form.expiry} onChange={(v) => set("expiry", v)} error={errors.expiry} placeholder="MM / YY" />
                <Field label="CVC" value={form.cvc} onChange={(v) => set("cvc", v)} error={errors.cvc} placeholder="123" />
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs font-bold text-muted">
                <LockKeyhole className="h-4 w-4 text-brand" /> Secured with SSL. This demo does not
                process real payments.
              </p>
            </StepShell>
          ) : null}

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => (step === 0 ? router.push("/cart") : setStep((s) => s - 1))}
              className={buttonClasses("outline")}
            >
              {step === 0 ? "Back to basket" : "Back"}
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} className={buttonClasses("primary")}>
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" onClick={placeOrder} className={buttonClasses("primary")}>
                <LockKeyhole className="h-4 w-4" /> Place secure order
              </button>
            )}
          </div>
        </div>
      </div>

      <aside className="rounded-4xl border border-line bg-ink p-6 text-white shadow-2xl lg:sticky lg:top-40 lg:self-start">
        <h2 className="text-2xl font-black tracking-[-0.05em]">Your order</h2>
        <div className="mt-5 max-h-64 space-y-3 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className={cn("grid h-12 w-12 flex-none place-items-center rounded-2xl bg-gradient-to-br text-sm font-black", categoryGradient(item.category))}>
                {item.brand.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-black">{item.name}</strong>
                <span className="text-xs font-bold text-white/60">Qty {item.qty}</span>
              </div>
              <span className="text-sm font-black">{formatGBP(item.price * item.qty)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-2 border-t border-white/15 pt-4 text-sm font-bold text-white/70">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-white">{formatGBP(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span className="text-white">{delivery === 0 ? "Free" : formatGBP(delivery)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-base font-black text-white">
            <span>Total</span>
            <span>{formatGBP(total)}</span>
          </div>
        </div>
        <div className="mt-5 rounded-3xl bg-lime p-4 text-sm font-black leading-6 text-ink">
          <Gift className="mb-1 h-5 w-5" />
          You’ll earn {points} loyalty points on this order.
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-white/60">
          <CreditCard className="h-4 w-4 text-lime" /> Stripe & Global Payments ready
        </div>
      </aside>
    </section>
  );
}

function StepShell({ title, subtitle, children }) {
  return (
    <div className="pv-fade-in">
      <h2 className="text-2xl font-black tracking-[-0.05em] text-ink">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm font-bold text-muted">{subtitle}</p> : null}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, error, type = "text", placeholder, wide = false }) {
  return (
    <label className={cn("grid gap-1.5 text-sm font-black text-ink", wide && "sm:col-span-2")}>
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "min-h-12 rounded-2xl border bg-white px-4 font-bold outline-none transition focus-visible:ring-4",
          error ? "border-accent ring-accent/15" : "border-line focus-visible:ring-brand/20",
        )}
      />
      {error ? <span className="text-xs font-black text-accent">{error}</span> : null}
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*  Forms                                                                       */
/* -------------------------------------------------------------------------- */

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="grid content-center gap-3 rounded-3xl bg-soft p-6 text-center">
        <BadgeCheck className="mx-auto h-10 w-10 text-brand" />
        <strong className="text-lg font-black text-ink">You’re subscribed</strong>
        <p className="text-sm font-bold text-muted">
          Watch your inbox for new drops, bundle pricing, and loyalty campaigns.
        </p>
      </div>
    );
  }

  return (
    <form
      className="grid content-center gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (email.includes("@")) setDone(true);
      }}
    >
      <label className="text-sm font-black text-ink" htmlFor="newsletter-email">
        Email address
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="min-h-12 flex-1 rounded-full border border-line bg-white px-5 font-bold outline-none transition focus-visible:ring-4 focus-visible:ring-brand/20"
        />
        <button type="submit" className={buttonClasses("primary")}>
          Subscribe
        </button>
      </div>
      <p className="text-xs leading-6 text-muted">
        By subscribing, customers agree to receive Phoenix Vapers marketing and can unsubscribe at
        any time.
      </p>
    </form>
  );
}

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  function submit(e) {
    e.preventDefault();
    setPending(true);
    setTimeout(() => {
      setPending(false);
      setSent(true);
    }, 700);
  }

  if (sent) {
    return (
      <div className="grid content-center gap-3 rounded-3xl bg-soft p-8 text-center">
        <BadgeCheck className="mx-auto h-12 w-12 text-brand" />
        <strong className="text-xl font-black text-ink">Message sent</strong>
        <p className="text-sm font-bold text-muted">
          Our support team replies during weekday business hours (8am–4pm).
        </p>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      {[
        ["Name", "text"],
        ["Email address", "email"],
        ["Order number", "text"],
      ].map(([label, type]) => (
        <label key={label} className="grid gap-1.5 text-sm font-black text-ink">
          {label}
          <input
            required={label !== "Order number"}
            type={type}
            className="min-h-12 rounded-2xl border border-line bg-white px-4 font-bold outline-none transition focus-visible:ring-4 focus-visible:ring-brand/20"
          />
        </label>
      ))}
      <label className="grid gap-1.5 text-sm font-black text-ink">
        Message
        <textarea
          required
          className="min-h-32 rounded-2xl border border-line bg-white p-4 font-bold outline-none transition focus-visible:ring-4 focus-visible:ring-brand/20"
        />
      </label>
      <button type="submit" disabled={pending} className={buttonClasses("primary")}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          "Send message"
        )}
      </button>
    </form>
  );
}
