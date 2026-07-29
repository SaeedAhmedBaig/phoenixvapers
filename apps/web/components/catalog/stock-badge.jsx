import { cn } from "@/lib/utils";

export function StockBadge({ inStock, className = "" }) {
  if (inStock) {
    return (
      <span className={cn("bg-card text-pine inline-flex items-center gap-1.5 rounded-full border border-border/80 px-2 py-0.5 text-[10px] font-medium shadow-sm", className)}>
        <span className="bg-primary size-1.5 rounded-full" aria-hidden />
        In stock
      </span>
    );
  }
  return (
    <span className={cn("bg-muted text-muted-foreground inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium", className)}>
      Out of stock
    </span>
  );
}
