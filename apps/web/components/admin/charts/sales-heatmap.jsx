import { formatPence } from "@phoenix/utils/money";

/**
 * Order-volume heatmap, day-of-week × hour-of-day (§28). A plain CSS grid,
 * not Recharts — it has no heatmap primitive, and forcing a ScatterChart to
 * do this is more complex than a grid (GitHub-contribution-graph style).
 * Native `title` tooltips per cell — zero extra JS for hover detail.
 *
 * Pure display only: the "Peak: ..." headline figure (the always-visible,
 * no-hover-required number, matching RevenueDonut/OrderFunnel's convention)
 * is computed and rendered by the CALLER, not here, so this component stays
 * a plain, reusable grid.
 *
 *   cells: Array<{ dow: 0-6, hour: 0-23, orders: number, revenueMinor: number }>
 *          — exactly 168 entries, dow-major order (from GET /admin/reports/sales-heatmap)
 */
export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOUR_TICKS = [0, 3, 6, 9, 12, 15, 18, 21];

export function SalesHeatmap({ cells, maxOrders }) {
  const byDay = Array.from({ length: 7 }, () => new Array(24).fill(null));
  for (const c of cells) byDay[c.dow][c.hour] = c;

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Hour header */}
        <div className="ml-10 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-px">
          {Array.from({ length: 24 }, (_, hour) => (
            <span key={hour} className="text-muted-foreground text-center text-[9px]">
              {HOUR_TICKS.includes(hour) ? hour : ""}
            </span>
          ))}
        </div>

        {DAY_LABELS.map((label, dow) => (
          <div key={label} className="mt-1 flex items-center gap-1">
            <span className="text-muted-foreground w-9 shrink-0 text-right text-[11px]">{label}</span>
            <div className="grid flex-1 grid-cols-[repeat(24,minmax(0,1fr))] gap-px">
              {byDay[dow].map((cell, hour) => {
                const orders = cell?.orders ?? 0;
                const opacity = orders === 0 ? 0.06 : 0.15 + 0.85 * (orders / Math.max(1, maxOrders));
                return (
                  <div
                    key={hour}
                    title={`${label} ${String(hour).padStart(2, "0")}:00 — ${orders} order${orders === 1 ? "" : "s"}, ${formatPence(cell?.revenueMinor ?? 0)}`}
                    className="border-border/30 aspect-square border"
                    style={{ backgroundColor: "var(--color-primary)", opacity }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
