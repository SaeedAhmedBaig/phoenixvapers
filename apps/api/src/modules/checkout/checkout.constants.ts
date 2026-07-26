/**
 * Delivery options (spec §6.3 — clear articulation of delivery timing;
 * §6.2 — no surprise costs). Prices are GROSS (what the customer sees);
 * the pricing engine backs VAT out of them.
 *
 * Age-verification-on-delivery: every Phoenix parcel is age-checked at
 * the door by the carrier — a compliance property of the service we buy,
 * surfaced in checkout copy (§6.3).
 */
export interface DeliveryMethod {
  id: string;
  label: string;
  description: string;
  grossMinor: number;
  /** Goods gross total at which this method becomes free; null = never. */
  freeOverMinor: number | null;
}

export const DELIVERY_METHODS: readonly DeliveryMethod[] = [
  {
    id: 'standard',
    label: 'Standard delivery',
    description: '2–3 working days · age-checked at the door',
    grossMinor: 399,
    freeOverMinor: 4000, // free over £40 of goods
  },
  {
    id: 'express',
    label: 'Express delivery',
    description: 'Next working day · age-checked at the door',
    grossMinor: 599,
    freeOverMinor: null,
  },
] as const;

/** The charge a method costs for a given goods total (gross pence). */
export function deliveryChargeMinor(
  method: DeliveryMethod,
  goodsGrossMinor: number,
): number {
  if (
    method.freeOverMinor !== null &&
    goodsGrossMinor >= method.freeOverMinor
  ) {
    return 0;
  }
  return method.grossMinor;
}
