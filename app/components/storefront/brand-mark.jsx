import Link from "next/link";
import { Flame } from "lucide-react";
import { cn } from "../../lib/utils";

export function BrandMark({ compact = false, inverse = false, className }) {
  return (
    <Link className={cn("flex items-center gap-2.5", className)} href="/" aria-label="Phoenix Vapers home">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Flame className="h-5 w-5" strokeWidth={2.25} />
      </span>
      {!compact ? (
        <span className="leading-tight">
          <strong className={cn("block text-base font-black tracking-tight", inverse ? "text-surface-dark-foreground" : "text-foreground")}>
            Phoenix Vapers
          </strong>
          <small className={cn("block text-[0.7rem] font-bold", inverse ? "text-surface-dark-muted" : "text-muted-foreground")}>
            Regulated UK vape retail
          </small>
        </span>
      ) : null}
    </Link>
  );
}
