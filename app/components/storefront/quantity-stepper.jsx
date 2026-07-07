import { Minus, Plus } from "lucide-react";
import { cn } from "../../lib/utils";

export function QuantityStepper({ value, onChange, min = 1, max = 99, className, size = "default" }) {
  const compact = size === "sm";
  return (
    <div className={cn("inline-flex items-center rounded-full border border-border bg-card", className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(
          "grid place-items-center rounded-full text-foreground transition hover:bg-secondary disabled:opacity-30",
          compact ? "h-8 w-8" : "h-10 w-10",
        )}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className={cn("min-w-8 text-center font-black text-foreground", compact ? "text-sm" : "text-base")} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn(
          "grid place-items-center rounded-full text-foreground transition hover:bg-secondary disabled:opacity-30",
          compact ? "h-8 w-8" : "h-10 w-10",
        )}
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
