/**
 * Priced basket projection (spec §6.2) — what the storefront renders.
 *
 * Built live on every read: line prices come from the pricing engine and
 * availability from the catalogue's CURRENT state, so a product retired
 * or re-priced after add-to-basket is reflected immediately and honestly.
 * Unavailable lines stay visible (flagged) rather than silently vanishing
 * — no surprises is a design rule (§6.2).
 */

import type { PriceBreakdown } from '../pricing/pricing.engine';
import type { PricingService } from '../pricing/pricing.service';
import type { CartLine } from './schemas/cart.schema';

/** Why a line cannot be bought right now. */
export type LineIssue = 'no-longer-available' | 'out-of-stock';

export interface PricedCartLine {
  sku: string;
  quantity: number;
  purchaseType: string;
  /** Display data resolved from the live catalogue. */
  name?: string;
  slug?: string;
  brand?: string;
  image?: { url: string; alt: string };
  attributes?: Record<string, string>;
  /** False ⇒ excluded from totals and blocked at checkout. */
  available: boolean;
  issue?: LineIssue;
  unit?: PriceBreakdown;
  line?: PriceBreakdown;
}

export interface PricedCart {
  lines: PricedCartLine[];
  /** Units across purchasable lines — the header badge number. */
  itemCount: number;
  /** Goods only; delivery joins the breakdown at checkout (§6.3). */
  totals: PriceBreakdown;
  /** True when at least one line has an issue the customer must see. */
  needsAttention: boolean;
}

export function toPricedCart(
  lines: CartLine[],
  resolved: Map<string, { product: any; variant: any }>,
  pricing: PricingService,
): PricedCart {
  const pricedLines: PricedCartLine[] = lines.map((line) => {
    const hit = resolved.get(line.sku);

    if (!hit) {
      // Retired, unpublished, or deleted since it was added.
      return {
        sku: line.sku,
        quantity: line.quantity,
        purchaseType: line.purchaseType,
        available: false,
        issue: 'no-longer-available',
      };
    }

    const { product, variant } = hit;
    const display = {
      sku: line.sku,
      quantity: line.quantity,
      purchaseType: line.purchaseType,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      image: product.media?.[0]
        ? { url: product.media[0].url, alt: product.media[0].alt }
        : undefined,
      attributes: variant.attributes ?? {},
    };

    // Honest stock display — stubbed until Phase 4 inventory.
    if (!variant.inStockStub) {
      return { ...display, available: false, issue: 'out-of-stock' as const };
    }

    const input = {
      unitNetMinor: variant.netPriceMinor ?? 0,
      dutyClassification: product.complianceProfile?.dutyClassification,
      containerVolumeMl: product.complianceProfile?.containerVolumeMl,
    };

    return {
      ...display,
      available: true,
      unit: pricing.unit(input),
      line: pricing.line(input, line.quantity),
    };
  });

  const purchasable = pricedLines.filter((l) => l.available);

  return {
    lines: pricedLines,
    itemCount: purchasable.reduce((sum, l) => sum + l.quantity, 0),
    totals: pricing.total(purchasable.map((l) => l.line!)),
    needsAttention: pricedLines.some((l) => !l.available),
  };
}
