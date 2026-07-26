import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SpotlightCard } from "@/components/ui/spotlight-card";
import { CategoryIcon } from "@/lib/category-icons";

export function CategoryTile({ category }) {
  return (
    <SpotlightCard as={Link} href={`/c/${category.slug}`} className="flex flex-col p-6">
      <div className="bg-accent flex size-12 items-center justify-center rounded-none transition-colors group-hover:bg-primary/10">
        <CategoryIcon slug={category.slug} className="text-pine size-6" />
      </div>
      <h3 className="mt-4 font-medium">{category.label}</h3>
      <p className="text-muted-foreground mt-1.5 flex-1 text-sm leading-relaxed">{category.blurb}</p>
      <span className="text-pine mt-5 inline-flex items-center gap-1 text-xs font-semibold tracking-wide uppercase">
        Shop now <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </SpotlightCard>
  );
}
