import { z } from 'zod';

import { DELIVERY_METHODS } from '../checkout.constants';

/**
 * Place-order payload (spec §6.3). Deliberately tiny: the address is a
 * saved-address INDEX (the server snapshots the stored address — the
 * client never asserts address content at checkout), the delivery method
 * must be one we actually offer, and the payment method is an opaque PSP
 * token — raw card data cannot be expressed here [COMPLIANCE §6.4].
 */
export const placeOrderSchema = z.object({
  addressIndex: z.number().int().min(0).max(19),
  deliveryMethodId: z.enum(
    DELIVERY_METHODS.map((m) => m.id) as [string, ...string[]],
  ),
  paymentMethodToken: z
    .string()
    .regex(/^pm_[a-z0-9_]{2,64}$/, 'Unrecognised payment method token'),
});

export type PlaceOrderDto = z.infer<typeof placeOrderSchema>;
