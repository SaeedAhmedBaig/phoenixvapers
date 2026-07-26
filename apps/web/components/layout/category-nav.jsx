"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CATEGORIES } from "@/lib/categories";

/** Category text rail — single chrome location (spec §5.1). */
export function CategoryNav() {
  const path = usePathname();
  const active = path.startsWith("/c/") ? path.split("/")[2] : null;

  return (
    <div className="border-border border-b bg-card">
      <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex gap-5 py-2.5" aria-label="Categories">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/c/${c.slug}`}
              aria-current={active === c.slug ? "page" : undefined}
              className={
                active === c.slug
                  ? "text-pine shrink-0 text-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground shrink-0 text-sm font-medium transition-colors"
              }
            >
              {c.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
