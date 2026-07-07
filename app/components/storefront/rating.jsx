import { Star } from "lucide-react";
import { cn } from "../../lib/utils";

export function Rating({ value = 0, reviews, size = "sm", className }) {
  const rounded = Math.round(value * 2) / 2;

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="flex items-center" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= rounded;
          const half = !filled && i + 0.5 === rounded;
          return (
            <Star
              key={i}
              className={cn(
                size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
                filled || half ? "fill-warning text-warning" : "fill-none text-border",
              )}
              strokeWidth={filled || half ? 0 : 1.5}
            />
          );
        })}
      </span>
      <span className="sr-only">{value} out of 5 stars</span>
      {reviews != null ? (
        <span className="text-xs font-bold text-muted-foreground">({reviews})</span>
      ) : null}
    </span>
  );
}
