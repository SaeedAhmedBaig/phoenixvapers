"use client";

import Link from "next/link";
import { Check } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FILTER_GROUPS, filterToggleHref, isFilterActive } from "@/lib/filters";

export function FilterSidebar({ basePath, searchParams, facets }) {
  const sections = FILTER_GROUPS.map((g) => ({ ...g, values: facets?.[g.key] ?? [] })).filter((s) => s.values.length);

  if (!sections.length) return <p className="text-muted-foreground text-sm">No filters available.</p>;

  return (
    <Accordion type="multiple" defaultValue={sections.slice(0, 4).map((s) => s.key)} className="w-full">
      {sections.map((s) => {
        return (
          <AccordionItem key={s.key} value={s.key}>
            <AccordionTrigger className="py-3 text-xs font-semibold uppercase hover:no-underline">{s.title}</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1">
                {s.values.map(({ value, count }) => {
                  const on = isFilterActive(searchParams, s.param, value);
                  return (
                    <li key={value}>
                      <Link
                        href={filterToggleHref(basePath, searchParams, s.param, value, on)}
                        className={`flex items-center justify-between rounded-none px-2 py-1.5 text-sm ${on ? "bg-accent text-pine font-medium" : "hover:bg-muted"}`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`flex size-4 items-center justify-center rounded-none border ${on ? "border-pine bg-pine text-white" : "border-border"}`}>
                            {on ? <Check className="size-2.5" /> : null}
                          </span>
                          {s.format(value)}
                        </span>
                        <span className="text-muted-foreground font-mono text-xs">{count}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
