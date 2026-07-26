/**
 * Catalogue CSV schema — the single source of truth shared by bulk export
 * and bulk import, so a file exported from the console re-imports cleanly.
 * One row = one product with its first variant flattened alongside.
 */

export const PRODUCT_CSV_COLUMNS = [
  { key: "name", header: "name" },
  { key: "brand", header: "brand" },
  { key: "range", header: "range" },
  { key: "category", header: "category" },
  { key: "status", header: "status" }, // export-only; ignored on import
  { key: "sku", header: "sku" },
  { key: "netPriceMinor", header: "netPriceMinor" },
  { key: "inStockStub", header: "inStock" },
  { key: "strengthMgPerMl", header: "strengthMgPerMl" },
  { key: "volumeMl", header: "volumeMl" },
  { key: "vgPg", header: "vgPg" },
  { key: "madeIn", header: "madeIn" },
  { key: "batchTested", header: "batchTested" },
  { key: "mediaUrl", header: "mediaUrl" },
  { key: "mediaAlt", header: "mediaAlt" },
  { key: "description", header: "description" },
];

/** Flatten a product document into a CSV row object. */
export function flattenProduct(doc) {
  const variant = doc.variants?.[0] ?? {};
  const spec = doc.specification ?? {};
  const prov = doc.provenance ?? {};
  const media = doc.media?.[0] ?? {};
  return {
    name: doc.name ?? "",
    brand: doc.brand ?? "",
    range: doc.range ?? "",
    category: doc.category ?? "",
    status: doc.status ?? "",
    sku: variant.sku ?? "",
    netPriceMinor: variant.netPriceMinor ?? "",
    inStockStub: variant.inStockStub === false ? "false" : "true",
    strengthMgPerMl: spec.strengthMgPerMl ?? "",
    volumeMl: spec.volumeMl ?? "",
    vgPg: spec.vgPg ?? "",
    madeIn: prov.madeIn ?? "",
    batchTested: prov.batchTested ? "true" : "false",
    mediaUrl: media.url ?? "",
    mediaAlt: media.alt ?? "",
    description: doc.description ?? "",
  };
}

const num = (v) => (v === "" || v == null ? undefined : Number(v));
const bool = (v, dflt) => {
  const s = String(v ?? "").trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(s)) return true;
  if (["false", "0", "no", "n"].includes(s)) return false;
  return dflt;
};

/**
 * Turn a CSV row (keyed by HEADER names) into a create-product body. The
 * API still validates every field (Zod) — this only shapes the payload;
 * `status` is intentionally ignored so import always yields a fresh draft.
 */
export function rowToCreateBody(row) {
  const mediaUrl = String(row.mediaUrl ?? "").trim();
  const mediaAlt = String(row.mediaAlt ?? "").trim();
  return {
    name: String(row.name ?? "").trim(),
    brand: String(row.brand ?? "").trim(),
    range: String(row.range ?? "").trim() || undefined,
    category: String(row.category ?? "").trim(),
    description: String(row.description ?? "").trim(),
    media: mediaUrl && mediaAlt ? [{ url: mediaUrl, alt: mediaAlt }] : [],
    specification: {
      ...(row.strengthMgPerMl ? { strengthMgPerMl: num(row.strengthMgPerMl) } : {}),
      ...(row.volumeMl ? { volumeMl: num(row.volumeMl) } : {}),
      ...(row.vgPg ? { vgPg: String(row.vgPg).trim() } : {}),
    },
    provenance: {
      madeIn: String(row.madeIn ?? "United Kingdom").trim() || "United Kingdom",
      batchTested: bool(row.batchTested, true),
    },
    variants: [
      {
        sku: String(row.sku ?? "").trim().toUpperCase(),
        attributes: {},
        netPriceMinor: num(row.netPriceMinor),
        inStockStub: bool(row.inStock, true),
      },
    ],
  };
}
