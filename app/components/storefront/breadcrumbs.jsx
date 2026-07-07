import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 overflow-x-auto text-sm font-bold text-muted-foreground">
      <Link href="/" className="flex items-center gap-1 shrink-0 transition hover:text-primary" aria-label="Home">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, index) => (
        <span key={item.label} className="flex shrink-0 items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          {item.href && index !== items.length - 1 ? (
            <Link href={item.href} className="transition hover:text-primary">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
