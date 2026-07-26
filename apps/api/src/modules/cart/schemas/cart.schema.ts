import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * Cart collection (spec §6.2) — the persistent basket.
 *
 * A cart belongs to EITHER a signed-in customer (customerId) or a guest
 * (anonymousTokenHash — SHA-256 of an opaque bearer token held in an
 * httpOnly cookie by the storefront BFF; the raw token is never stored).
 * Guest carts merge into the customer cart at sign-in and are deleted.
 *
 * Lines store ONLY sku/quantity/purchaseType. Prices, stock, and
 * compliance state are resolved live on every read (§6.2: live pricing;
 * revalidate at checkout, not only at add-to-basket time) — a stored
 * price would go stale the moment a rate or price-list change lands.
 */

export enum PurchaseType {
  ONE_OFF = 'one-off',
  SUBSCRIPTION = 'subscription',
}

@Schema({ _id: false })
export class CartLine {
  @Prop({ required: true })
  sku!: string;

  @Prop({ required: true, min: 1 })
  quantity!: number;

  /** One-off vs subscription lines are clearly separated (§6.2). */
  @Prop({
    type: String,
    enum: Object.values(PurchaseType),
    default: PurchaseType.ONE_OFF,
  })
  purchaseType!: PurchaseType;

  @Prop({ required: true })
  addedAt!: Date;
}

@Schema({ collection: 'carts', timestamps: true, strict: 'throw' })
export class Cart {
  /** Owner when signed in — at most one open cart per customer. */
  @Prop({ type: Types.ObjectId, unique: true, sparse: true })
  customerId?: Types.ObjectId;

  /** Guest owner — hash only; possession of the DB never grants a cart. */
  @Prop({ unique: true, sparse: true })
  anonymousTokenHash?: string;

  @Prop({ type: [CartLine], default: [] })
  lines!: CartLine[];

  @Prop({ default: 1 })
  schemaVersion!: number;

  /** Managed by `{ timestamps: true }` — declared for type visibility. */
  createdAt?: Date;
  updatedAt?: Date;
}

export type CartDocument = HydratedDocument<Cart>;
export const CartSchema = SchemaFactory.createForClass(Cart);

// Abandoned GUEST carts are reaped after 60 days (data minimisation,
// §16.5); customer carts persist — the basket survives sessions (§6.2).
CartSchema.index(
  { updatedAt: 1 },
  {
    expireAfterSeconds: 60 * 24 * 60 * 60,
    partialFilterExpression: { anonymousTokenHash: { $exists: true } },
  },
);
