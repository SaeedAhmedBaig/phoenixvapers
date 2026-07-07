import { formatMinor } from "../../lib/utils";
import { cn } from "../../lib/utils";

export function Price({ minor, compareAtMinor, size = "default", className }) {
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-black tracking-tight text-foreground",
          size === "lg" ? "text-4xl" : size === "sm" ? "text-base" : "text-2xl",
        )}
      >
        {formatMinor(minor)}
      </span>
      {compareAtMinor ? (
        <span className="text-sm font-bold text-muted-foreground line-through">
          {formatMinor(compareAtMinor)}
        </span>
      ) : null}
    </span>
  );
}
