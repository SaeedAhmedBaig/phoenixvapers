import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Pagination({ basePath, qs, currentPage, totalPages }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1);
  const href = (p) => {
    const n = new URLSearchParams(qs);
    if (p > 1) n.set("page", String(p)); else n.delete("page");
    const s = n.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  return (
    <nav className="mt-8 flex justify-center gap-1" aria-label="Pagination">
      {currentPage > 1 ? <Button asChild variant="outline" size="sm"><Link href={href(currentPage - 1)}>Prev</Link></Button> : null}
      {pages.map((p) => (
        <Button key={p} asChild variant={p === currentPage ? "default" : "outline"} size="sm">
          <Link href={href(p)}>{p}</Link>
        </Button>
      ))}
      {currentPage < totalPages ? <Button asChild variant="outline" size="sm"><Link href={href(currentPage + 1)}>Next</Link></Button> : null}
    </nav>
  );
}
