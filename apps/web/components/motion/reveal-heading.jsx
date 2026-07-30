"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

/**
 * One-time, word-by-word fade+rise reveal for hero headlines (ReactBits
 * "Blur Text", restrained to the brand's motion rules — §22.3: brief,
 * 150–250 ms, functional not decorative). Runs once on mount, never loops,
 * and is a complete no-op under `prefers-reduced-motion`: the heading is
 * simply visible immediately, nothing to disable or skip.
 *
 * Deliberately opacity+transform only, NOT `filter: blur()` (the original
 * ReactBits recipe animates blur too) — animating blur forces the browser
 * to re-rasterise every frame instead of just compositing, and doing that
 * for several overlapping inline words at once is what made this look
 * janky/stuttery rather than smooth. Opacity and transform are the two
 * properties every browser can animate on the compositor thread alone.
 *
 * Callers pass already-split words so spacing and per-word colour (e.g. the
 * `pine` highlight) stay under their own control — no fragile string-split/
 * rejoin logic inside the component:
 *
 *   <RevealHeading words={[
 *     { text: "The" }, { text: "Standard" },
 *     { text: "of", break: true }, { text: "Trust.", className: "text-pine" },
 *   ]} />
 */
export function RevealHeading({ words, as: Tag = "h1", className = "" }) {
  const reduceMotion = useReducedMotion();

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <span key={i}>
          {word.break ? <br /> : i > 0 ? " " : null}
          <motion.span
            className={cn("inline-block", word.className)}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: i * 0.045, ease: "easeOut" }}
          >
            {word.text}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
