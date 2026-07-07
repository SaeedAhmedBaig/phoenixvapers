"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, SlidersHorizontal } from "lucide-react";
import { getProducts } from "../../lib/api";
import { ProductGrid } from "./product-grid";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Sheet, SheetContent, SheetHeader } from "../ui/sheet";
import { Skeleton } from "../ui/skeleton";

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Top rated" },
];

const PAGE_SIZE = 24;

export function ProductBrowser({ category, collection, heading, initialResult }) {
  const [format, setFormat] = useState(new Set());
  const [flavour, setFlavour] = useState(new Set());
  const [brand, setBrand] = useState(new Set());
  const [onlyDeals, setOnlyDeals] = useState(false);
  const [sort, setSort] = useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [items, setItems] = useState(initialResult?.items ?? []);
  const [facets, setFacets] = useState(initialResult?.facets ?? { formats: [], flavours: [], brands: [] });
  const [total, setTotal] = useState(initialResult?.total ?? 0);
  const [page, setPage] = useState(initialResult?.page ?? 1);
  const [pages, setPages] = useState(initialResult?.pages ?? 1);
  const [loading, setLoading] = useState(!initialResult);
  const [loadingMore, setLoadingMore] = useState(false);

  const skipFirstFetch = useRef(Boolean(initialResult));
  const sentinelRef = useRef(null);

  const activeCount = format.size + flavour.size + brand.size + (onlyDeals ? 1 : 0);

  const queryParams = {
    category,
    collection,
    sort,
    limit: PAGE_SIZE,
    onlyDeals: onlyDeals || undefined,
    format: format.size ? [...format].join(",") : undefined,
    flavour: flavour.size ? [...flavour].join(",") : undefined,
    brand: brand.size ? [...brand].join(",") : undefined,
  };

  // Reset to page 1 whenever filters/sort/route change.
  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }
    setLoading(true);
    getProducts({ ...queryParams, page: 1 })
      .then((result) => {
        setItems(result.items);
        setFacets(result.facets);
        setTotal(result.total);
        setPage(result.page);
        setPages(result.pages);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, collection, sort, onlyDeals, format, flavour, brand]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || page >= pages) return;
    setLoadingMore(true);
    try {
      const result = await getProducts({ ...queryParams, page: page + 1 });
      setItems((prev) => [...prev, ...result.items]);
      setPage(result.page);
      setPages(result.pages);
    } finally {
      setLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMore, loading, page, pages, category, collection, sort, onlyDeals, format, flavour, brand]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "600px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  function toggle(setter) {
    return (value) =>
      setter((prev) => {
        const next = new Set(prev);
        next.has(value) ? next.delete(value) : next.add(value);
        return next;
      });
  }

  function clearAll() {
    setFormat(new Set());
    setFlavour(new Set());
    setBrand(new Set());
    setOnlyDeals(false);
  }

  const filterGroups = (
    <div className="grid gap-6">
      <FilterGroup title="Format" values={facets.formats} active={format} onToggle={toggle(setFormat)} />
      {facets.flavours.length ? (
        <FilterGroup title="Flavour" values={facets.flavours} active={flavour} onToggle={toggle(setFlavour)} />
      ) : null}
      <FilterGroup title="Brand" values={facets.brands} active={brand} onToggle={toggle(setBrand)} />

      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-muted p-3 text-sm font-black text-foreground">
        <Checkbox checked={onlyDeals} onCheckedChange={(v) => setOnlyDeals(!!v)} />
        On offer only
      </label>
    </div>
  );

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[280px_1fr]">
      <aside className="hidden lg:block">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-40">
          <div className="mb-5 flex items-center justify-between">
            <strong className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-foreground">
              <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
            </strong>
            {activeCount > 0 ? (
              <button type="button" onClick={clearAll} className="text-xs font-black text-primary">
                Clear ({activeCount})
              </button>
            ) : null}
          </div>
          {filterGroups}
        </div>
      </aside>

      <div>
        <div className="mb-5 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-primary">{heading}</p>
            <h2 className="mt-0.5 text-xl font-black tracking-tight text-foreground">
              {total} {total === 1 ? "product" : "products"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="lg:hidden" onClick={() => setMobileFiltersOpen(true)}>
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {activeCount > 0 ? <span className="text-primary">({activeCount})</span> : null}
            </Button>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4.2] rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            <ProductGrid products={items} />

            {page < pages ? (
              <div ref={sentinelRef} className="mt-8 flex items-center justify-center py-6">
                {loadingMore ? (
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading more products…
                  </span>
                ) : null}
              </div>
            ) : items.length > 0 ? (
              <p className="mt-8 text-center text-sm font-bold text-muted-foreground">
                You've reached the end — {total} {total === 1 ? "product" : "products"} shown.
              </p>
            ) : null}
          </>
        )}
      </div>

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent title="Filters">
          <SheetHeader onClose={() => setMobileFiltersOpen(false)}>
            <strong className="text-lg font-black text-foreground">Filters</strong>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-5">{filterGroups}</div>
          <div className="grid grid-cols-2 gap-3 border-t border-border p-5">
            <Button variant="outline" onClick={clearAll}>
              Clear
            </Button>
            <Button onClick={() => setMobileFiltersOpen(false)}>Show {total}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}

function FilterGroup({ title, values, active, onToggle }) {
  if (!values?.length) return null;
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-foreground">{title}</p>
      <div className="mt-2.5 grid gap-2">
        {values.map((value) => (
          <label key={value} className="flex cursor-pointer items-center gap-2.5 text-sm font-bold text-muted-foreground">
            <Checkbox checked={active.has(value)} onCheckedChange={() => onToggle(value)} />
            <span className={active.has(value) ? "text-foreground" : ""}>{value}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
