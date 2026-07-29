/**
 * Public (storefront) projections of the product document.
 *
 * Serializers are the privacy/security boundary for reads: they build the
 * response UP from named fields — internal data (operator ids, audit
 * fields, schemaVersion, Mongo internals) can never leak by omission.
 *
 * Prices come from the pricing engine (§6.5) — the serializer receives the
 * resolved `PricingParams` from the calling service and never invents
 * money maths of its own.
 */

import {
  priceUnit,
  type PriceBreakdown,
  type PricingParams,
} from '../../pricing/pricing.engine';

export type { PriceBreakdown };

export interface ProductCard {
  slug: string;
  name: string;
  brand: string;
  range?: string;
  category: string;
  image?: { url: string; alt: string };
  productType?: string;
  strengthMgPerMl?: number;
  volumeMl?: number;
  vgPg?: string;
  inStock: boolean;
  fromPrice?: PriceBreakdown;
}

export interface ProductDetail extends ProductCard {
  description: string;
  media: { url: string; alt: string }[];
  specification: Record<string, unknown>;
  provenance: { madeIn?: string; batchTested?: boolean };
  mandatedWarnings: string[];
  variants: {
    sku: string;
    attributes: Record<string, string>;
    inStock: boolean;
    price?: PriceBreakdown;
  }[];
  /** Same flavour at other nicotine strengths — each its own product
   *  document (see Product.flavourFamily). Empty when the product isn't
   *  part of a family or has no sellable siblings. */
  strengthSiblings: {
    slug: string;
    strengthMgPerMl?: number;
    fromPrice?: PriceBreakdown;
  }[];
}

/** Duty- and VAT-inclusive display price for one variant, engine-computed. */
function variantBreakdown(
  doc: any,
  variant: any,
  pricing: PricingParams,
): PriceBreakdown | undefined {
  if (variant?.netPriceMinor === undefined) return undefined;

  return priceUnit(
    {
      unitNetMinor: variant.netPriceMinor,
      dutyClassification: doc.complianceProfile?.dutyClassification,
      containerVolumeMl: doc.complianceProfile?.containerVolumeMl,
    },
    pricing,
  );
}

export function toProductCard(doc: any, pricing: PricingParams): ProductCard {
  const cheapest = [...(doc.variants ?? [])]
    .filter((v: any) => v.netPriceMinor !== undefined)
    .sort((a: any, b: any) => a.netPriceMinor - b.netPriceMinor)[0];

  return {
    slug: doc.slug,
    name: doc.name,
    brand: doc.brand,
    range: doc.range,
    category: doc.category,
    image: doc.media?.[0]
      ? { url: doc.media[0].url, alt: doc.media[0].alt }
      : undefined,
    productType: doc.complianceProfile?.productType,
    strengthMgPerMl: doc.complianceProfile?.nicotineStrengthMgPerMl,
    volumeMl: doc.complianceProfile?.containerVolumeMl,
    vgPg: doc.specification?.vgPg,
    // Honest stock display (spec §5.2) — stubbed until Phase 4 inventory.
    inStock: (doc.variants ?? []).some((v: any) => v.inStockStub),
    fromPrice: variantBreakdown(doc, cheapest, pricing),
  };
}

export function toProductDetail(
  doc: any,
  pricing: PricingParams,
  strengthSiblingDocs: any[] = [],
): ProductDetail {
  return {
    ...toProductCard(doc, pricing),
    description: doc.description,
    media: (doc.media ?? []).map((m: any) => ({ url: m.url, alt: m.alt })),
    specification: doc.specification ?? {},
    provenance: {
      madeIn: doc.provenance?.madeIn,
      batchTested: doc.provenance?.batchTested,
    },
    // Warnings are primary PDP content, never buried (spec §5.3).
    mandatedWarnings: doc.complianceProfile?.mandatedWarnings ?? [],
    variants: (doc.variants ?? []).map((v: any) => ({
      sku: v.sku,
      attributes: v.attributes ?? {},
      inStock: Boolean(v.inStockStub),
      price: variantBreakdown(doc, v, pricing),
    })),
    strengthSiblings: strengthSiblingDocs
      .map((sib: any) => {
        const cheapest = [...(sib.variants ?? [])]
          .filter((v: any) => v.netPriceMinor !== undefined)
          .sort((a: any, b: any) => a.netPriceMinor - b.netPriceMinor)[0];
        return {
          slug: sib.slug,
          strengthMgPerMl: sib.complianceProfile?.nicotineStrengthMgPerMl,
          fromPrice: variantBreakdown(sib, cheapest, pricing),
        };
      })
      .sort((a, b) => (a.strengthMgPerMl ?? 0) - (b.strengthMgPerMl ?? 0)),
  };
}
