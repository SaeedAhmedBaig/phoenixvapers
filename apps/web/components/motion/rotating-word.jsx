"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

/**
 * Soft crossfade word-rotator (ReactBits "Rotating Text", restrained to a
 * quiet 240 ms fade+slide — §22.3). Under `prefers-reduced-motion` it shows
 * only the first word and never rotates, so nothing keeps re-triggering for
 * a screen-reader user re-reading the surrounding sentence either.
 *
 * The overlapping grid cell (`col-start-1 row-start-1`) lets the entering
 * and exiting words crossfade in place without a layout jump, without
 * needing a fixed width for the longest word.
 *
 * Ready to use, but NOT yet wired into any hero copy — the words a
 * rotator cycles through are marketing copy and should be a deliberate,
 * brand-voiced choice, not something invented here.
 *
 *   <RotatingWord words={["the Switcher", "the Enthusiast", "the Trade Buyer"]} />
 */
export function RotatingWord({ words, interval = 2600, className = "" }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || words.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [reduceMotion, words.length, interval]);

  const current = words[reduceMotion ? 0 : index];

  return (
    <span className={cn("relative inline-grid align-baseline", className)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={current}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="col-start-1 row-start-1"
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
