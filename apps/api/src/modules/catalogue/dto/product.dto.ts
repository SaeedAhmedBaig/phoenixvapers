import { z } from 'zod';

import {
  BANNED_PRODUCT_TYPES,
  CATEGORIES,
  LIQUID_PRODUCT_TYPES,
  SELLABLE_PRODUCT_TYPES,
  TPD_MAX_NICOTINE_VOLUME_ML,
  TPD_MAX_STRENGTH_MG_PER_ML,
  type SellableProductType,
} from '../catalogue.constants';

/* ─────────────────────────── building blocks ─────────────────────────── */

/**
 * Media URLs: https or site-relative only. Rejecting other schemes at the
 * boundary makes stored-XSS via `javascript:`/`data:` URLs structurally
 * impossible wherever media is later rendered.
 */
const safeUrl = z
  .string()
  .max(2048)
  .regex(/^(https:\/\/|\/)[^\s]*$/, 'must be an https:// or site-relative URL');

const mediaItemSchema = z.object({
  url: safeUrl,
  alt: z.string().trim().min(3).max(300),
});

const specificationSchema = z
  .object({
    strengthMgPerMl: z.number().min(0).max(TPD_MAX_STRENGTH_MG_PER_ML),
    volumeMl: z.number().positive().max(10_000),
    vgPg: z.string().regex(/^\d{1,2}\/\d{1,2}0?$/, 'format e.g. 70/30'),
    ingredients: z.array(z.string().trim().min(1).max(120)).max(50),
    compatibleDevices: z.array(z.string().trim().min(1).max(120)).max(50),
    coilOhms: z.number().positive().max(10),
  })
  .partial();

const provenanceSchema = z
  .object({
    madeIn: z.string().trim().min(2).max(80),
    batchTested: z.boolean(),
  })
  .partial();

const variantSchema = z.object({
  sku: z
    .string()
    .regex(/^[A-Z0-9][A-Z0-9-]{3,31}$/, 'SKU: A-Z, 0-9 and dashes, 4-32 chars'),
  attributes: z.record(z.string().max(40), z.string().max(120)).default({}),
  barcode: z
    .string()
    .regex(/^\d{8,14}$/)
    .optional(),
  weightGrams: z.number().positive().max(50_000).optional(),
  /** Net unit price in integer pence, ex duty/VAT — the price list (§6.5). */
  netPriceMinor: z.number().int().min(0).max(10_000_000).optional(),
  inStockStub: z.boolean().default(true),
});

/* ────────────────────── merchandiser-editable data ───────────────────── */

/**
 * What a Merchandiser may create/edit. DELIBERATELY contains no
 * complianceProfile — compliance fields have their own DTO and their own
 * role-gated endpoint (segregation of duties, spec §3.2). Zod strips any
 * unknown keys, so smuggling compliance fields in here is impossible.
 */
export const createProductSchema = z.object({
  name: z.string().trim().min(3).max(160),
  brand: z.string().trim().min(2).max(80),
  range: z.string().trim().min(2).max(80).optional(),
  category: z.enum(CATEGORIES),
  description: z.string().trim().min(20).max(5_000),
  media: z.array(mediaItemSchema).max(12).default([]),
  specification: specificationSchema.default({}),
  provenance: provenanceSchema.default({}),
  variants: z
    .array(variantSchema)
    .min(1)
    .max(50)
    .refine(
      (variants) =>
        new Set(variants.map((v) => v.sku)).size === variants.length,
      'variant SKUs must be unique within the product',
    ),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;

/* ───────────────────── compliance profile (officer-only) ─────────────── */

const isLiquid = (type: SellableProductType) =>
  LIQUID_PRODUCT_TYPES.includes(type);

/**
 * [COMPLIANCE] The compliance profile as a Compliance Officer submits it.
 * Encodes the TPD/TRPR rules (spec §4.1/§4.3) so a non-compliant profile
 * cannot even be SAVED, let alone approved:
 *  - banned types (single-use disposables) rejected outright;
 *  - strength <= 20 mg/ml;
 *  - nicotine-containing liquid limited to 10 ml containers;
 *  - shortfills are 0 mg by definition;
 *  - nicotine products need an MHRA notification number and warnings;
 *  - every liquid (including 0 mg) is duty-classified as vaping-liquid (§4.4).
 */
export const complianceProfileSchema = z
  .object({
    productType: z
      .string()
      .refine(
        (value): value is SellableProductType =>
          !(BANNED_PRODUCT_TYPES as readonly string[]).includes(value) &&
          (SELLABLE_PRODUCT_TYPES as readonly string[]).includes(value),
        'This product type is banned or unknown and can never be listed',
      ),
    nicotineStrengthMgPerMl: z
      .number()
      .min(0)
      .max(TPD_MAX_STRENGTH_MG_PER_ML, 'TPD limit is 20 mg/ml')
      .optional(),
    containerVolumeMl: z.number().positive().max(10_000).optional(),
    notificationNumber: z
      .string()
      .regex(/^[A-Z0-9][A-Z0-9-]{4,29}$/, 'invalid notification number')
      .optional(),
    mandatedWarnings: z
      .array(z.string().trim().min(5).max(500))
      .max(10)
      .default([]),
    dutyClassification: z.enum(['vaping-liquid', 'non-liquid']),
  })
  .superRefine((profile, ctx) => {
    const type = profile.productType;

    if (isLiquid(type)) {
      if (profile.nicotineStrengthMgPerMl === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['nicotineStrengthMgPerMl'],
          message: 'Required for liquids (0 for nicotine-free)',
        });
      }
      if (profile.containerVolumeMl === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['containerVolumeMl'],
          message: 'Required for liquids',
        });
      }
      if (profile.dutyClassification !== 'vaping-liquid') {
        ctx.addIssue({
          code: 'custom',
          path: ['dutyClassification'],
          message:
            'All vaping liquid (including 0 mg) is duty-classified vaping-liquid',
        });
      }

      const strength = profile.nicotineStrengthMgPerMl ?? 0;

      if (type === 'shortfill' && strength !== 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['nicotineStrengthMgPerMl'],
          message: 'Shortfills are nicotine-free by definition',
        });
      }

      if (strength > 0) {
        if (
          profile.containerVolumeMl !== undefined &&
          profile.containerVolumeMl > TPD_MAX_NICOTINE_VOLUME_ML
        ) {
          ctx.addIssue({
            code: 'custom',
            path: ['containerVolumeMl'],
            message:
              'Nicotine-containing e-liquid is limited to 10 ml containers (TPD)',
          });
        }
        if (!profile.notificationNumber) {
          ctx.addIssue({
            code: 'custom',
            path: ['notificationNumber'],
            message:
              'MHRA notification number required before a nicotine product sells',
          });
        }
        if (profile.mandatedWarnings.length === 0) {
          ctx.addIssue({
            code: 'custom',
            path: ['mandatedWarnings'],
            message: 'Nicotine products carry mandated warnings',
          });
        }
      }
    } else if (profile.dutyClassification !== 'non-liquid') {
      ctx.addIssue({
        code: 'custom',
        path: ['dutyClassification'],
        message: 'Non-liquid products are duty-classified non-liquid',
      });
    }
  });

export type ComplianceProfileDto = z.infer<typeof complianceProfileSchema>;

/* ─────────────────────────── misc admin DTOs ─────────────────────────── */

export const rejectReviewSchema = z.object({
  reason: z.string().trim().min(5).max(1_000),
});
export type RejectReviewDto = z.infer<typeof rejectReviewSchema>;

/* ─────────────────────────── public list query ───────────────────────── */

/**
 * PLP query — every parameter bounded and validated so list endpoints
 * cannot be abused for scraping-scale page sizes or query injection.
 */
/** Admin console list query — status filter, free-text search, paging. */
export const adminListQuerySchema = z.object({
  status: z.enum(['draft', 'review', 'sellable', 'retired']).optional(),
  q: z.string().trim().min(1).max(80).optional(),
  page: z.coerce.number().int().min(1).max(1_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});
export type AdminListQuery = z.infer<typeof adminListQuerySchema>;

/**
 * A comma-separated list param → a validated array (or undefined when absent).
 * Facets are multi-select (WooCommerce-style layered nav, §5.2): the storefront
 * sends `?brand=Phoenix,Aurora` and the service turns each list into an `$in`.
 * Bounded to 20 values so the query can't be inflated for abuse.
 */
const csvOf = <T extends z.ZodTypeAny>(item: T) =>
  z
    .string()
    .optional()
    .transform((raw) => {
      if (!raw) return undefined;
      const values = raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      return values.length ? values : undefined;
    })
    .pipe(z.array(item).min(1).max(20).optional());

export const listProductsQuerySchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  type: csvOf(
    z
      .string()
      .refine(
        (value) => (SELLABLE_PRODUCT_TYPES as readonly string[]).includes(value),
        'unknown product type',
      ),
  ),
  brand: csvOf(z.string().trim().min(1).max(80)),
  range: csvOf(z.string().trim().min(1).max(80)),
  strengthMgPerMl: csvOf(
    z.coerce.number().min(0).max(TPD_MAX_STRENGTH_MG_PER_ML),
  ),
  volumeMl: csvOf(z.coerce.number().positive().max(10_000)),
  vgPg: csvOf(z.string().regex(/^\d{1,2}\/\d{1,2}0?$/, 'format e.g. 70/30')),
  price: csvOf(z.enum(['under-5', '5-10', '10-20', 'over-20'])),
  inStock: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).max(1_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(24),
  sort: z.enum(['newest', 'name', 'price-asc', 'price-desc']).default('newest'),
});
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
