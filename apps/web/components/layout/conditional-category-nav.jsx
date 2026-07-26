"use client";

import { usePathname } from "next/navigation";

import { CategoryNav } from "@/components/layout/category-nav";

/** Category rail only on catalogue pages — not duplicated on home (has its own gateway). */
export function ConditionalCategoryNav() {
  const path = usePathname();
  const show =
    path.startsWith("/c/") ||
    path.startsWith("/p/") ||
    path.startsWith("/search");

  if (!show) return null;
  return <CategoryNav />;
}
