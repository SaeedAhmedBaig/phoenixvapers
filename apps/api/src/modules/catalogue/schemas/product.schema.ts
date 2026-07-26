import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import {
  BANNED_PRODUCT_TYPES,
  CATEGORIES,
  ProductStatus,
  SELLABLE_PRODUCT_TYPES,
} from '../catalogue.constants';

/**
 * Product collection (spec §18 `products`).
 *
 * Variants and the compliance profile are EMBEDDED because they are small,
 * bounded, and always read with the product. Commerce data (name, media,
 * spec) and locked compliance data live on one document but are mutated
 * through separate, role-gated service methods — the separation is
 * enforced by permissions, not by collection layout (spec §7.2).
 */

@Schema({ _id: false })
class MediaItem {
  @Prop({ required: true })
  url!: string;

  /** Meaningful alt text is mandatory — WCAG 2.2 AA (spec §22.6). */
  @Prop({ required: true })
  alt!: string;
}

@Schema({ _id: false })
class Specification {
  /** mg/ml as displayed; authoritative limit checks live in the DTOs. */
  @Prop()
  strengthMgPerMl?: number;

  @Prop()
  volumeMl?: number;

  /** e.g. "70/30" — VG/PG ratio for liquids. */
  @Prop()
  vgPg?: string;

  @Prop({ type: [String], default: undefined })
  ingredients?: string[];

  @Prop({ type: [String], default: undefined })
  compatibleDevices?: string[];

  @Prop()
  coilOhms?: number;
}

@Schema({ _id: false })
class Provenance {
  /** e.g. "United Kingdom" — the PDP leads with this (spec §5.3). */
  @Prop()
  madeIn?: string;

  @Prop({ default: false })
  batchTested!: boolean;
}

@Schema({ _id: false })
class Variant {
  @Prop({ required: true })
  sku!: string;

  /** Display attributes, e.g. { strength: "10mg", size: "10ml" }. */
  @Prop({ type: Object, default: {} })
  attributes!: Record<string, string>;

  @Prop()
  barcode?: string;

  @Prop()
  weightGrams?: number;

  /**
   * Retail NET unit price in integer pence, ex duty and VAT — the Edition
   * 1.0 price list (§6.5). Display and charged prices are derived from
   * this by the pricing engine, never stored inclusive.
   */
  @Prop()
  netPriceMinor?: number;

  /** STUB until Phase 4 (inventory) — honest stock display placeholder. */
  @Prop({ default: true })
  inStockStub!: boolean;
}

@Schema({ _id: false })
class ComplianceProfile {
  /**
   * [COMPLIANCE] Banned types are rejected at every layer; this schema-level
   * validator is the last line of defence if service logic is ever bypassed.
   */
  @Prop({
    validate: {
      validator: (value: string) =>
        !(BANNED_PRODUCT_TYPES as readonly string[]).includes(value) &&
        (SELLABLE_PRODUCT_TYPES as readonly string[]).includes(value),
      message: 'Banned or unknown product type can never be listed',
    },
  })
  productType?: string;

  @Prop()
  nicotineStrengthMgPerMl?: number;

  @Prop()
  containerVolumeMl?: number;

  /** MHRA notification number — required before nicotine products sell. */
  @Prop()
  notificationNumber?: string;

  @Prop({ type: [String], default: undefined })
  mandatedWarnings?: string[];

  @Prop({ enum: ['vaping-liquid', 'non-liquid'] })
  dutyClassification?: string;

  /** Set by approval; any compliance-relevant edit clears all three. */
  @Prop()
  approvedBy?: string;

  @Prop()
  approvedAt?: Date;

  @Prop({ default: false })
  locked!: boolean;
}

@Schema({ collection: 'products', timestamps: true, strict: 'throw' })
export class Product {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  slug!: string;

  @Prop({ required: true })
  brand!: string;

  /** Product range within the brand, e.g. "Signature Salts". */
  @Prop()
  range?: string;

  @Prop({ required: true, enum: CATEGORIES })
  category!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: [MediaItem], default: [] })
  media!: MediaItem[];

  @Prop({ type: Specification, default: {} })
  specification!: Specification;

  @Prop({ type: Provenance, default: {} })
  provenance!: Provenance;

  @Prop({ type: [Variant], default: [] })
  variants!: Variant[];

  @Prop({ type: ComplianceProfile, default: {} })
  complianceProfile!: ComplianceProfile;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(ProductStatus),
    default: ProductStatus.DRAFT,
    index: true,
  })
  status!: ProductStatus;

  /** Forward-only migration key (spec §18). */
  @Prop({ default: 1 })
  schemaVersion!: number;
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes per spec §18: unique slug (declared on @Prop), unique variant SKUs
// across documents, category+status for PLP queries, text index for search.
ProductSchema.index({ 'variants.sku': 1 }, { unique: true, sparse: true });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index(
  { name: 'text', brand: 'text', description: 'text' },
  { weights: { name: 10, brand: 5, description: 1 } },
);
