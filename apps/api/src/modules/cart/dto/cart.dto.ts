import { z } from 'zod';

import { PurchaseType } from '../schemas/cart.schema';

/**
 * Basket limits (§6.2 "per-customer limits"). Deliberately generous —
 * they exist to stop abuse and fat-finger orders, not normal shoppers.
 * Checkout re-validates them server-side regardless of what the UI shows.
 */
export const MAX_LINE_QUANTITY = 10;
export const MAX_CART_LINES = 50;

const skuSchema = z
  .string()
  .regex(/^[A-Z0-9][A-Z0-9-]{3,31}$/, 'SKU: A-Z, 0-9 and dashes, 4-32 chars');

const quantitySchema = z.number().int().min(1).max(MAX_LINE_QUANTITY);

export const addLineSchema = z.object({
  sku: skuSchema,
  quantity: quantitySchema.default(1),
  purchaseType: z.nativeEnum(PurchaseType).default(PurchaseType.ONE_OFF),
});
export type AddLineDto = z.infer<typeof addLineSchema>;

export const updateLineSchema = z.object({
  quantity: quantitySchema,
});
export type UpdateLineDto = z.infer<typeof updateLineSchema>;

export const skuParamSchema = skuSchema;

/** Guest cart token — 64 hex chars (32 random bytes), minted server-side. */
export const cartTokenSchema = z.string().regex(/^[a-f0-9]{64}$/);

export const mergeCartSchema = z.object({
  cartToken: cartTokenSchema,
});
export type MergeCartDto = z.infer<typeof mergeCartSchema>;
