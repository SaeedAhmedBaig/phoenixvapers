import Link from "next/link";

import { ProductCard } from "@/components/catalog/product-card";
import { Pagination } from "@/components/catalog/pagination";
import { ApiDownNotice } from "@/components/catalog/warnings";
import { SectionEyebrow } from "@/components/home/section-eyebrow";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";

export async function generateMetadata({ searchParams }) {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q}` : "Search" };
}

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  for (const [key, raw] of Object.entries(sp)) {
    if (typeof raw === "string" && raw && key !== "q") qs.set(key, raw);
  }

  const raw = q.length >= 2 ? await apiGet(`/search?${qs}`) : null;
  const apiDown = q.length >= 2 && raw === null;
  const data = raw ?? { items: [], total: 0 };
  const { items = [], total = 0 } = data;
  const page = 1;
  const totalPages = 1;
  const basePath = "/search";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SectionEyebrow>Search</SectionEyebrow>
      <h1 className="font-display mt-1 text-3xl font-medium">
        {q ? <>Results for &ldquo;{q}&rdquo;</> : "Search the catalogue"}
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        {q ? `${total} result${total === 1 ? "" : "s"} · duty-inclusive pricing` : "Use the search bar in the header — try a brand, strength, or product name."}
      </p>

      {!q ? (
        <div className="phx-card mt-12 border-dashed py-16 text-center">
          <p className="text-muted-foreground text-sm">Typo-tolerant search with vaping vocabulary — &ldquo;juice&rdquo;, &ldquo;e-liquid&rdquo;, &ldquo;18mg menthol&rdquo;.</p>
        </div>
      ) : null}

      {apiDown ? <ApiDownNotice className="mt-6" /> : null}

      {items.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      ) : q ? (
        <div className="phx-card mt-12 py-16 text-center">
          <p className="font-medium">No products found</p>
          <p className="text-muted-foreground mt-2 text-sm">Try a different term or browse by category.</p>
          <Button asChild className="mt-6 rounded-none"><Link href="/c/e-liquids">Browse e-liquids</Link></Button>
        </div>
      ) : null}

      {items.length ? <Pagination basePath={basePath} qs={qs} currentPage={page} totalPages={totalPages} /> : null}
    </div>
  );
}
