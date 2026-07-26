/**
 * Catalogue domain constants.
 *
 * [COMPLIANCE] BANNED_PRODUCT_TYPES exist as recognised values precisely so
 * they can be structurally rejected everywhere (spec §4.1 — single-use
 * disposables banned since 1 Jun 2025). They are named, known, and
 * un-listable — not merely absent from an enum, which would let a future
 * edit re-introduce them silently.
 */

/** Types a product may legally be listed as. */
export const SELLABLE_PRODUCT_TYPES = [
  'e-liquid',
  'nic-salt',
  'shortfill',
  'hardware',
  'coil',
  'accessory',
  'cbd-liquid',
] as const;

/** Types that must never reach the catalogue. */
export const BANNED_PRODUCT_TYPES = ['disposable'] as const;

export type SellableProductType = (typeof SELLABLE_PRODUCT_TYPES)[number];

/** Product types that are vaping liquid — duty-bearing, TPD-limited. */
export const LIQUID_PRODUCT_TYPES: readonly SellableProductType[] = [
  'e-liquid',
  'nic-salt',
  'shortfill',
  'cbd-liquid',
];

/** Primary customer-facing categories (spec §5.1 information architecture). */
export const CATEGORIES = [
  'e-liquids',
  'nic-salts',
  'shortfills',
  'hardware-kits',
  'coils-consumables',
  'accessories',
  'cbd',
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Product listing lifecycle (spec §7.2 / Phase 1 prompt). */
export enum ProductStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  SELLABLE = 'sellable',
  RETIRED = 'retired',
}

/** Duty classification — drives the Phase 3 duty engine (spec §4.4). */
export const DUTY_CLASSIFICATIONS = ['vaping-liquid', 'non-liquid'] as const;
export type DutyClassification = (typeof DUTY_CLASSIFICATIONS)[number];

/**
 * [COMPLIANCE] TPD/TRPR 2016 hard limits (spec §4.1):
 * nicotine strength <= 20 mg/ml; nicotine-containing e-liquid <= 10 ml.
 */
export const TPD_MAX_STRENGTH_MG_PER_ML = 20;
export const TPD_MAX_NICOTINE_VOLUME_ML = 10;
