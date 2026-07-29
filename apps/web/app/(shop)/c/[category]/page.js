import Link from "next/link";
import { notFound } from "next/navigation";

import { FilterSidebar } from "@/components/catalog/filter-sidebar";
import { MobileFilterSheet } from "@/components/catalog/mobile-filter-sheet";
import { Pagination } from "@/components/catalog/pagination";
import { ProductCard } from "@/components/catalog/product-card";
import { SortSelect } from "@/components/catalog/sort-select";
import { ApiDownNotice } from "@/components/catalog/warnings";
import { SectionEyebrow } from "@/components/home/section-eyebrow";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CategoryIcon } from "@/lib/category-icons";
import { apiGet, EMPTY_PRODUCT_LIST } from "@/lib/api";
import { CATEGORIES, categoryIntro, categoryLabel } from "@/lib/categories";
import { activeFilterChips, clearAllFiltersHref, removeFilterHref } from "@/lib/filters";

export async function generateMetadata({ params }) {
  const { category } = await params;
  return { title: categoryLabel(category) };
}

function assertCategory(category) {
  if (!CATEGORIES.some((c) => c.slug === category)) notFound();
}

function buildQuery(category, searchParams) {
  const q = new URLSearchParams({ category });
  for (const [key, raw] of Object.entries(searchParams)) {
    if (typeof raw === "string" && raw && key !== "category") q.set(key, raw);
  }
  return q;
}

export default async function CategoryPage({ params, searchParams }) {
  const { category } = await params;
  assertCategory(category);
  const sp = await searchParams;
  const qs = buildQuery(category, sp);
  const raw = await apiGet(`/products?${qs}`);
  const apiDown = raw === null;
  const data = raw ?? EMPTY_PRODUCT_LIST;
  const { items = [], total = 0, page = 1, pageSize = 24, facets = {} } = data;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const basePath = `/c/${category}`;
  const chips = activeFilterChips(sp);
  const intro = categoryIntro(category);

  return (
    <div>
      {/* Category hero band */}
      <div className="border-border border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
          <Breadcrumb className="mb-5">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>{categoryLabel(category)}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex gap-5">
              <div className="bg-accent flex size-16 shrink-0 items-center justify-center rounded-full">
                <CategoryIcon slug={category} className="text-pine size-8" />
              </div>
              <div>
                <SectionEyebrow>Shop</SectionEyebrow>
                <h1 className="font-display mt-1 text-3xl font-medium sm:text-4xl">{categoryLabel(category)}</h1>
                {intro ? <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">{intro}</p> : null}
              </div>
            </div>
            <p className="text-muted-foreground shrink-0 font-mono text-sm tabular-nums">
              {total} product{total === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {apiDown ? <ApiDownNotice className="mb-6" /> : null}

        <div className="flex gap-8">
          <aside className="hidden w-52 shrink-0 lg:block xl:w-60">
            <div className="sticky top-28 rounded-lg border border-border/80 bg-card p-4 shadow-sm">
              <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-widest uppercase">Filters</p>
              <FilterSidebar basePath={basePath} searchParams={sp} facets={facets} />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="bg-surface-sunken mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <MobileFilterSheet basePath={basePath} searchParams={sp} facets={facets} />
                {chips.map((c) => (
                  <Button key={`${c.param}:${c.value}`} asChild variant="secondary" size="sm" className="h-7 text-xs">
                    <Link href={removeFilterHref(basePath, sp, c.param, c.value)}>{c.label} ×</Link>
                  </Button>
                ))}
                {chips.length ? (
                  <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                    <Link href={clearAllFiltersHref(basePath, sp)}>Clear all</Link>
                  </Button>
                ) : null}
              </div>
              <SortSelect basePath={basePath} searchParams={sp} />
            </div>

            {items.length ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((p) => <ProductCard key={p.slug} product={p} />)}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border py-20 text-center">
                <p className="font-medium">
                  {chips.length ? "No products match these filters" : `No ${categoryLabel(category).toLowerCase()} yet`}
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  {chips.length
                    ? "Try removing a filter or read our guidance."
                    : "We're adding to this range — check back soon, or explore what's already in stock."}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {chips.length ? (
                    <Button asChild variant="outline" className=""><Link href={basePath}>Clear filters</Link></Button>
                  ) : (
                    <Button asChild variant="outline" className=""><Link href="/c/e-liquids">Shop e-liquids</Link></Button>
                  )}
                  <Button asChild className=""><Link href="/guidance">New to vaping guide</Link></Button>
                </div>
              </div>
            )}

            <Pagination basePath={basePath} qs={qs} currentPage={page} totalPages={totalPages} />
          </div>
        </div>
      </div>
    </div>
  );
}
