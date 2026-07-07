"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { searchProducts } from "../../lib/api";
import { formatMinor } from "../../lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Dialog, DialogContent } from "../ui/dialog";
import { ProductVisual } from "./product-visual";

const POPULAR = ["Nic salts", "Shortfills", "Pod kits", "Coils", "CBD"];

export function SearchCommand({ open, onOpenChange }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      searchProducts(q)
        .then((data) => setResults(Array.isArray(data) ? data.slice(0, 8) : []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  function go(slug) {
    onOpenChange(false);
    router.push(`/product/${slug}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} className="top-[12%] max-w-2xl translate-y-0 p-0">
        <Command shouldFilter={false}>
          <CommandInput
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder="Search e-liquids, kits, coils, CBD…"
          />
          <CommandList>
            {query && !loading && results.length === 0 ? (
              <CommandEmpty>No products match "{query}". Try a flavour, brand, or format.</CommandEmpty>
            ) : null}

            {results.length ? (
              <CommandGroup heading="Products">
                {results.map((product) => (
                  <CommandItem key={product.slug} value={product.slug} onSelect={() => go(product.slug)}>
                    <ProductVisual product={product} className="h-12 w-12 shrink-0 rounded-xl" iconClassName="h-5 w-5" />
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-sm font-black text-foreground">{product.name}</strong>
                      <span className="text-xs font-bold text-muted-foreground">
                        {product.brandName} · {product.format}
                      </span>
                    </span>
                    <strong className="text-sm font-black text-foreground">{formatMinor(product.priceMinor)}</strong>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}

            {!query ? (
              <CommandGroup heading="Popular searches">
                {POPULAR.map((term) => (
                  <CommandItem key={term} value={term} onSelect={() => setQuery(term)}>
                    {term}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
