"use client";

import { SlidersHorizontal } from "lucide-react";

import { FilterSidebar } from "@/components/catalog/filter-sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { activeFilterCount } from "@/lib/filters";

export function MobileFilterSheet({ basePath, searchParams, facets }) {
  const count = activeFilterCount(searchParams);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontal className="size-4" />
          Filters{count ? ` (${count})` : ""}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
        <div className="px-4 pb-4"><FilterSidebar basePath={basePath} searchParams={searchParams} facets={facets} /></div>
      </SheetContent>
    </Sheet>
  );
}
