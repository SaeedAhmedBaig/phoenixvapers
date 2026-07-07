import { Truck } from "lucide-react";
import { formatMinor } from "../../lib/utils";

export function FreeShippingMeter({ remainingMinor, thresholdMinor, qualifies }) {
  const progress = thresholdMinor > 0 ? Math.min(100, ((thresholdMinor - remainingMinor) / thresholdMinor) * 100) : 100;

  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-bold text-foreground">
        <Truck className="h-4 w-4 shrink-0 text-primary" />
        {qualifies ? (
          <span>Free tracked delivery unlocked</span>
        ) : (
          <span>
            Add <strong className="text-primary">{formatMinor(remainingMinor)}</strong> more for free delivery
          </span>
        )}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
