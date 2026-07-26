/**
 * PLP filter configuration & URL helpers (spec §5.2).
 *
 * Facets are MULTI-SELECT (WooCommerce-style layered navigation): a facet can
 * hold several values at once, carried in the URL as a comma-separated list
 * (e.g. ?strengthMgPerMl=3,6&brand=Phoenix,Aurora). Availability is the one
 * single toggle. The API parses the same shape into `$in` queries.
 */

export const FILTER_PARAM_KEYS = [
  "inStock",
  "price",
  "brand",
  "type",
  "strengthMgPerMl",
  "volumeMl",
  "vgPg",
  "range",
];

/** Facets that accept several values at once. `inStock` is a single toggle. */
const MULTI_PARAMS = new Set([
  "price",
  "brand",
  "type",
  "strengthMgPerMl",
  "volumeMl",
  "vgPg",
  "range",
]);

/** Ordered groups for the filter accordion UI. */
export const FILTER_GROUPS = [
  {
    key: "inStock",
    param: "inStock",
    title: "Availability",
    format: (v) => (v === "true" ? "In stock" : "Out of stock"),
  },
  {
    key: "price",
    param: "price",
    title: "Price",
    format: (v) =>
      ({
        "under-5": "Under £5",
        "5-10": "£5 – £10",
        "10-20": "£10 – £20",
        "over-20": "Over £20",
      })[v] ?? v,
  },
  { key: "brand", param: "brand", title: "Brand", format: (v) => v },
  { key: "range", param: "range", title: "Product range", format: (v) => v },
  {
    key: "type",
    param: "type",
    title: "Product type",
    format: (v) =>
      ({
        "e-liquid": "E-liquid",
        "nic-salt": "Nic salt",
        shortfill: "Shortfill",
        hardware: "Hardware",
        coil: "Coil / consumable",
        accessory: "Accessory",
      })[v] ?? v,
  },
  {
    key: "strengthMgPerMl",
    param: "strengthMgPerMl",
    title: "Nicotine strength",
    format: (v) => (v === "0" ? "0mg (nicotine-free)" : `${v}mg/ml`),
  },
  {
    key: "volumeMl",
    param: "volumeMl",
    title: "Bottle size",
    format: (v) => `${v}ml`,
  },
  { key: "vgPg", param: "vgPg", title: "VG / PG ratio", format: (v) => v },
];

/** The currently-selected values for a param, as an array (order preserved). */
export function currentFilterValues(searchParams, param) {
  const raw = searchParams[param];
  if (typeof raw !== "string" || !raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Is a specific value selected within its facet? */
export function isFilterActive(searchParams, param, value) {
  return currentFilterValues(searchParams, param).includes(value);
}

/** Copy every param except `page` (any filter change returns to page 1). */
function carryParams(searchParams) {
  const next = new URLSearchParams();
  for (const [key, raw] of Object.entries(searchParams)) {
    if (typeof raw === "string" && raw && key !== "page") next.set(key, raw);
  }
  return next;
}

/**
 * Toggle a single value on/off within its facet, preserving the other
 * selected values in that facet and every other active filter.
 */
export function filterToggleHref(basePath, searchParams, param, value, isActive) {
  const next = carryParams(searchParams);

  if (MULTI_PARAMS.has(param)) {
    const values = currentFilterValues(searchParams, param);
    const updated = isActive
      ? values.filter((v) => v !== value)
      : [...values, value];
    if (updated.length) next.set(param, updated.join(","));
    else next.delete(param);
  } else if (isActive) {
    next.delete(param);
  } else {
    next.set(param, value);
  }

  const qs = next.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function clearAllFiltersHref(basePath, searchParams) {
  const next = new URLSearchParams();
  for (const [key, raw] of Object.entries(searchParams)) {
    if (typeof raw === "string" && raw && key !== "page" && !FILTER_PARAM_KEYS.includes(key)) {
      next.set(key, raw);
    }
  }
  const qs = next.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Remove one specific value from a facet (used by the active-filter chips). */
export function removeFilterHref(basePath, searchParams, param, value) {
  return filterToggleHref(basePath, searchParams, param, value, true);
}

/** One chip per selected value across all facets, each individually removable. */
export function activeFilterChips(searchParams) {
  return FILTER_GROUPS.flatMap(({ param, title, format }) =>
    currentFilterValues(searchParams, param).map((value) => ({
      param,
      title,
      value,
      label: format(value),
    })),
  );
}

/** Total number of selected values across every facet (for the mobile badge). */
export function activeFilterCount(searchParams) {
  return FILTER_PARAM_KEYS.reduce(
    (total, key) => total + currentFilterValues(searchParams, key).length,
    0,
  );
}
