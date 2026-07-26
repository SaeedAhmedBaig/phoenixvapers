/**
 * Pricing engine — pure calculation core (spec §6.5) [COMPLIANCE].
 *
 * The single source of truth for money on the platform. Everything here is
 * a pure function of (input, params): no I/O, no clock, no config reads —
 * so the duty/VAT maths can be unit-tested exhaustively (§4.4) and every
 * caller (catalogue display, cart, checkout, orders) produces identical
 * numbers from identical inputs.
 *
 * All amounts are integer pence. Nothing in this file may introduce a
 * float representation of money beyond the single VAT rounding step.
 */

/**
 * Rate parameters, resolved from configuration at the edge (PricingService).
 * A duty or VAT rate change is an operational action (env change + audit),
 * never a code change (§4.4).
 */
export interface PricingParams {
  /** Vaping Products Duty in pence per 10 ml (or part thereof) — §4.4. */
  dutyMinorPer10Ml: number;
  /** VAT rate in basis points, e.g. 2000 = 20%. */
  vatRateBp: number;
}

/** Itemised money breakdown — stored on every priced line and total (§6.5). */
export interface PriceBreakdown {
  netMinor: number;
  dutyMinor: number;
  vatMinor: number;
  totalMinor: number;
}

/** What the engine needs to know about a product unit to price it. */
export interface UnitPricingInput {
  /** Net unit price from the price list (variant), ex duty and VAT. */
  unitNetMinor: number;
  /** From the locked compliance profile: 'vaping-liquid' | 'non-liquid'. */
  dutyClassification?: string;
  /** Container volume from the locked compliance profile. */
  containerVolumeMl?: number;
}

const ZERO: PriceBreakdown = {
  netMinor: 0,
  dutyMinor: 0,
  vatMinor: 0,
  totalMinor: 0,
};

function assertNonNegativeInt(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(
      `${label} must be a non-negative integer, got ${value}`,
    );
  }
}

/**
 * Vaping Products Duty for ONE unit (§4.4).
 *
 * Charged on every millilitre of vaping liquid INCLUDING 0 mg nicotine,
 * at the configured rate per 10 ml or part thereof (11 ml duties as 20 ml
 * would — volume is ceiled to the next 10 ml band, matching HMRC's
 * "per 10ml or part" basis). Non-liquid products carry no duty.
 */
export function unitDutyMinor(
  input: UnitPricingInput,
  params: PricingParams,
): number {
  if (input.dutyClassification !== 'vaping-liquid') return 0;
  if (!input.containerVolumeMl || input.containerVolumeMl <= 0) return 0;

  return Math.ceil(input.containerVolumeMl / 10) * params.dutyMinorPer10Ml;
}

/**
 * VAT on a (net + duty) base — duty is inside the VAT base, which is why
 * duty and VAT must be computed together, never independently.
 * Rounded half-up to the penny (inputs are non-negative by contract).
 */
function vatOnMinor(baseMinor: number, params: PricingParams): number {
  return Math.round((baseMinor * params.vatRateBp) / 10_000);
}

/** Duty- and VAT-inclusive breakdown for a single unit — display prices. */
export function priceUnit(
  input: UnitPricingInput,
  params: PricingParams,
): PriceBreakdown {
  return priceLine(input, 1, params);
}

/**
 * Breakdown for a line of `quantity` units.
 *
 * Net and duty scale exactly (integer × integer); VAT is rounded ONCE at
 * line level — the legally accepted basis for invoices, and it avoids
 * accumulating per-unit rounding error across large lines.
 */
export function priceLine(
  input: UnitPricingInput,
  quantity: number,
  params: PricingParams,
): PriceBreakdown {
  assertNonNegativeInt(input.unitNetMinor, 'unitNetMinor');
  assertNonNegativeInt(params.dutyMinorPer10Ml, 'dutyMinorPer10Ml');
  assertNonNegativeInt(params.vatRateBp, 'vatRateBp');
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new RangeError(
      `quantity must be a positive integer, got ${quantity}`,
    );
  }

  const netMinor = input.unitNetMinor * quantity;
  const dutyMinor = unitDutyMinor(input, params) * quantity;
  const vatMinor = vatOnMinor(netMinor + dutyMinor, params);

  return {
    netMinor,
    dutyMinor,
    vatMinor,
    totalMinor: netMinor + dutyMinor + vatMinor,
  };
}

/**
 * A duty-free, VAT-carrying line priced from its GROSS amount — delivery
 * charges (§6.2 shows delivery in the same honest breakdown as goods).
 * Delivery is configured as the price customers see (e.g. £3.99), so VAT
 * is backed out of the gross via the VAT fraction and net is the exact
 * remainder — the displayed charge never drifts by a rounding penny.
 */
export function priceDelivery(
  grossMinor: number,
  params: PricingParams,
): PriceBreakdown {
  assertNonNegativeInt(grossMinor, 'delivery grossMinor');
  const vatMinor = Math.round(
    (grossMinor * params.vatRateBp) / (10_000 + params.vatRateBp),
  );
  return {
    netMinor: grossMinor - vatMinor,
    dutyMinor: 0,
    vatMinor,
    totalMinor: grossMinor,
  };
}

/** Exact component-wise sum — totals are sums of already-rounded lines. */
export function sumBreakdowns(parts: PriceBreakdown[]): PriceBreakdown {
  return parts.reduce(
    (acc, p) => ({
      netMinor: acc.netMinor + p.netMinor,
      dutyMinor: acc.dutyMinor + p.dutyMinor,
      vatMinor: acc.vatMinor + p.vatMinor,
      totalMinor: acc.totalMinor + p.totalMinor,
    }),
    ZERO,
  );
}
