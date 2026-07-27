"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from "recharts";

/**
 * Catalogue status composition (§28) — clones RevenueDonut's exact pattern
 * (Pie/Cell donut hole + absolutely-positioned center-label div overlay,
 * not Recharts' native Label) so every donut in the console shares one
 * visual language. Adds click-to-filter: clicking a slice navigates straight
 * into the products list's OWN already-working ?status= filter (see
 * apps/web/app/admin/products/page.js's `filters` array) — no new
 * filtering logic invented here.
 *
 * No "channel" dimension exists on orders (verified against the schema), so
 * this donut is built from data the dashboard already fetches — draft/
 * review/sellable/retired counts — rather than an invented axis.
 */
const SERIES = [
  { key: "draft", name: "Draft", color: "var(--color-muted-foreground)" },
  { key: "review", name: "In review", color: "var(--color-warning)" },
  { key: "sellable", name: "Sellable", color: "var(--color-primary)" },
  { key: "retired", name: "Retired", color: "var(--color-info)" },
];

function Tip({ active, payload, total }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const pct = total > 0 ? ((p.value / total) * 100).toFixed(1) : "0.0";
  return (
    <div className="border-border bg-popover px-3 py-2 text-xs shadow-sm">
      <p className="font-medium">{p.name}</p>
      <p className="tabular-nums">{p.value} · {pct}%</p>
    </div>
  );
}

function activeShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 6}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
}

export function CatalogueStatusDonut({ counts }) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(null);

  const data = SERIES.map((s) => ({ ...s, value: Math.max(0, counts?.[s.key] ?? 0) }));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="grid items-center gap-6 sm:grid-cols-2">
      <div className="relative mx-auto h-56 w-full max-w-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={total > 0 ? data : [{ name: "No data", value: 1, color: "var(--color-muted)" }]}
              dataKey="value"
              nameKey="name"
              innerRadius="64%"
              outerRadius="92%"
              paddingAngle={total > 0 ? 1.5 : 0}
              strokeWidth={0}
              isAnimationActive={false}
              activeIndex={activeIndex}
              activeShape={activeShape}
              onMouseEnter={(_, i) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={(_, i) => {
                if (total === 0) return;
                router.push(`/admin/products?status=${data[i].key}`);
              }}
              className={total > 0 ? "cursor-pointer" : undefined}
            >
              {(total > 0 ? data : [{ color: "var(--color-muted)" }]).map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            {total > 0 ? <Tooltip content={<Tip total={total} />} /> : null}
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-muted-foreground text-[11px] uppercase tracking-wide">Catalogue</span>
          <span className="font-display text-xl font-medium tabular-nums">{total}</span>
        </div>
      </div>

      {/* Exact-value legend — figures visible without interaction, and each
          row is a click target too so the drill-down isn't hover-only. */}
      <dl className="space-y-2.5">
        {data.map((d, i) => {
          const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : "0.0";
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => total > 0 && router.push(`/admin/products?status=${d.key}`)}
              className="flex w-full items-center gap-2.5 text-left"
            >
              <span className="size-2.5 shrink-0" style={{ background: d.color }} aria-hidden />
              <dt className="text-muted-foreground min-w-[92px] text-sm">{d.name}</dt>
              <dd className="ml-auto text-sm font-medium tabular-nums">{d.value}</dd>
              <dd className="text-muted-foreground w-12 text-right text-xs tabular-nums">{pct}%</dd>
            </button>
          );
        })}
      </dl>
    </div>
  );
}
