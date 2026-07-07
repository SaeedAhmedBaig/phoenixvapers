import { Battery, Droplet, Leaf, Zap } from "lucide-react";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";

const CATEGORY_ICON = {
  "e-liquids": Droplet,
  hardware: Zap,
  coils: Battery,
  cbd: Leaf,
};

/** Icon-led product art standing in for photography, tied to category identity rather than random colour. */
export function ProductVisual({ product, className, iconClassName }) {
  const Icon = CATEGORY_ICON[product.categorySlug ?? product.category] ?? Droplet;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-secondary",
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-accent/10" />
      <Icon className={cn("relative text-primary/70", iconClassName ?? "h-16 w-16")} strokeWidth={1.25} />

      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
        {product.badge ? <Badge variant="default">{product.badge}</Badge> : null}
        {product.stockStatus === "low" ? <Badge variant="warning">Low stock</Badge> : null}
        {product.stockStatus === "out" ? <Badge variant="destructive">Out of stock</Badge> : null}
      </div>
    </div>
  );
}
