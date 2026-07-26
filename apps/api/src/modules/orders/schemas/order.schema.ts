import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * Order collection (spec §7.1/§7.2) — the central commercial object.
 *
 * Everything commercially or legally relevant is SNAPSHOTTED onto the
 * order at creation (names, addresses, per-line money, verification
 * evidence): later catalogue edits, price changes, or address updates
 * must never rewrite what a customer actually bought (§4.6 evidence).
 *
 * State is authoritative HERE; other modules request transitions through
 * OrdersService — nothing else mutates an order (§7.1).
 */

/**
 * Phase 3 slice of the §7.1 state machine — through Accepted, plus the
 * failure branches. Fulfilment states (Allocated → … → Completed) arrive
 * with Phase 4 orders-and-inventory.
 */
export enum OrderStatus {
  CREATED = 'created',
  PAYMENT_AUTHORISED = 'payment_authorised',
  PAYMENT_FAILED = 'payment_failed',
  COMPLIANCE_CONFIRMED = 'compliance_confirmed',
  ACCEPTED = 'accepted',
  /** Operationally paused by an operator (§7.3) — fulfilment does not act. */
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
}

/** [COMPLIANCE §7.1] The only legal moves. Everything else is a bug. */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.CREATED]: [
    OrderStatus.PAYMENT_AUTHORISED,
    OrderStatus.PAYMENT_FAILED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.PAYMENT_AUTHORISED]: [
    OrderStatus.COMPLIANCE_CONFIRMED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.PAYMENT_FAILED]: [OrderStatus.CANCELLED],
  [OrderStatus.COMPLIANCE_CONFIRMED]: [
    OrderStatus.ACCEPTED,
    OrderStatus.CANCELLED,
  ],
  // §7.3 operator controls: an accepted order can be held or cancelled;
  // a held order resumes or cancels. Fulfilment states (Allocated → …)
  // open from ACCEPTED as Phase 4 inventory lands.
  [OrderStatus.ACCEPTED]: [OrderStatus.ON_HOLD, OrderStatus.CANCELLED],
  [OrderStatus.ON_HOLD]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
  [OrderStatus.CANCELLED]: [],
};

@Schema({ _id: false })
class Money {
  @Prop({ required: true })
  netMinor!: number;

  @Prop({ required: true })
  dutyMinor!: number;

  @Prop({ required: true })
  vatMinor!: number;

  @Prop({ required: true })
  totalMinor!: number;
}

@Schema({ _id: false })
class OrderLine {
  @Prop({ required: true })
  sku!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  brand!: string;

  @Prop({ type: Object, default: {} })
  attributes!: Record<string, string>;

  @Prop({ required: true, min: 1 })
  quantity!: number;

  @Prop({ required: true })
  purchaseType!: string;

  /** Per-unit and per-line money, itemised — duty reporting reads these. */
  @Prop({ type: Money, required: true })
  unit!: Money;

  @Prop({ type: Money, required: true })
  line!: Money;
}

@Schema({ _id: false })
class DeliveryAddress {
  @Prop({ required: true })
  line1!: string;

  @Prop()
  line2?: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ required: true })
  postcode!: string;

  @Prop({ required: true, default: 'GB' })
  country!: string;
}

@Schema({ _id: false })
class Delivery {
  @Prop({ required: true })
  methodId!: string;

  @Prop({ required: true })
  methodLabel!: string;

  @Prop({ type: DeliveryAddress, required: true })
  address!: DeliveryAddress;

  @Prop({ type: Money, required: true })
  charge!: Money;
}

@Schema({ _id: false })
class Payment {
  /** Which PSP adapter authorised this order. */
  @Prop({ required: true })
  provider!: string;

  /** PSP intent id — our only payment handle. NEVER raw card data (§6.4). */
  @Prop()
  intentId?: string;

  @Prop({ enum: ['authorised', 'captured', 'declined', 'failed', 'refunded'] })
  status?: string;

  @Prop()
  authorisedAt?: Date;

  @Prop()
  capturedAt?: Date;

  @Prop()
  declineReason?: string;

  /** Set when an operator refunds a captured order (§7.3). */
  @Prop()
  refundedAt?: Date;

  @Prop()
  refundedMinor?: number;
}

/**
 * [COMPLIANCE §4.6] Snapshot of the age-verification pass this sale relied
 * on — outcome and evidence reference only, never identity data. This is
 * how "prove this order went to a verified adult" is answered years later.
 */
@Schema({ _id: false })
class VerificationEvidence {
  @Prop({ required: true })
  evidenceRef!: string;

  @Prop({ required: true })
  verifiedAt!: Date;

  @Prop({ required: true })
  expiresAt!: Date;
}

@Schema({ _id: false })
class OrderEvent {
  @Prop({ required: true })
  at!: Date;

  @Prop()
  from?: string;

  @Prop({ required: true })
  to!: string;

  @Prop({ required: true })
  actor!: string;

  @Prop()
  note?: string;
}

@Schema({ collection: 'orders', timestamps: true, strict: 'throw' })
export class Order {
  /** Human order reference, e.g. PHX-10042 — unique and sequential. */
  @Prop({ required: true, unique: true })
  orderNumber!: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  customerId!: Types.ObjectId;

  /** Contact snapshot at purchase time. */
  @Prop({ required: true })
  email!: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.CREATED,
    index: true,
  })
  status!: OrderStatus;

  @Prop({ type: [OrderLine], required: true })
  lines!: OrderLine[];

  /** Goods-only totals (sum of lines). */
  @Prop({ type: Money, required: true })
  goodsTotals!: Money;

  @Prop({ type: Delivery, required: true })
  delivery!: Delivery;

  /** Grand total = goods + delivery, fully itemised (§6.5). */
  @Prop({ type: Money, required: true })
  totals!: Money;

  @Prop({ type: Payment, required: true })
  payment!: Payment;

  @Prop({ type: VerificationEvidence })
  verification?: VerificationEvidence;

  /** Full event history — every transition, attributed (§7.1). */
  @Prop({ type: [OrderEvent], default: [] })
  events!: OrderEvent[];

  @Prop({ default: 1 })
  schemaVersion!: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);

// Console queries (§7.3): customer history and exception-first listings.
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

/**
 * Order-number sequence — a one-document counter collection gives gapless,
 * human-friendly references without racing (atomic $inc).
 */
@Schema({ collection: 'counters' })
export class Counter {
  @Prop({ required: true })
  _id!: string;

  @Prop({ required: true, default: 0 })
  seq!: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
