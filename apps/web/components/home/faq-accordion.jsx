import { ChevronDown } from "lucide-react";

/**
 * Native <details>/<summary> FAQ list — no client JS needed for expand/
 * collapse. The first item opens by default and every item shows a
 * chevron that rotates with state (`group-open:`), so the row visibly
 * reads as interactive instead of a plain text list with no affordance.
 */
export function FaqAccordion({ items }) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <details key={item.q} open={i === 0} className="phx-card group p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium marker:content-none [&::-webkit-details-marker]:hidden">
            {item.q}
            <ChevronDown className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
