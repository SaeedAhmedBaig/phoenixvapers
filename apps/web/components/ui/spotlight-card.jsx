"use client";

import { useCallback, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * A `.phx-card` with a soft, cursor-following glow on hover — adapted from
 * ReactBits' "Spotlight Card", stripped down to fit the brand's calm-motion
 * rules: pine-tinted only, capped opacity, radius-0, no glass/blur. Disabled
 * entirely on touch devices (no hover to follow) and never animates beyond
 * a plain opacity fade (handled in CSS, honours `prefers-reduced-motion`).
 *
 * Reserved for CLICKABLE cards (categories, personas) — the glow signals
 * "this opens something". Plain informational lists (trust pillars, the
 * roles list) keep the flat `.phx-card` untouched; not every box needs the
 * same treatment, which is the point (§ "same card pattern everywhere").
 *
 *   <SpotlightCard as={Link} href="/c/e-liquids" className="flex flex-col p-6">
 *     ...
 *   </SpotlightCard>
 */
export function SpotlightCard({ as: Component = "div", className, children, ...props }) {
  const ref = useRef(null);

  const handleMouseMove = useCallback((event) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }, []);

  return (
    <Component
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn("phx-card phx-spotlight group relative isolate", className)}
      {...props}
    >
      <span className="phx-spotlight-glow" aria-hidden />
      {children}
    </Component>
  );
}
