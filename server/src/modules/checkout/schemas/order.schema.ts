import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ _id: false })
export class OrderLine {
  @Prop({ type: Types.ObjectId, ref: "Product", required: true }) product: Types.ObjectId;

  @Prop({ required: true }) name: string;

  @Prop({ required: true }) brand: string;

  @Prop() strength?: string;

  @Prop({ required: true }) unitPriceMinor: number;

  @Prop({ required: true }) qty: number;

  @Prop({ required: true }) lineTotalMinor: number;
}
export const OrderLineSchema = SchemaFactory.createForClass(OrderLine);

@Schema({ _id: false })
export class OrderAddress {
  @Prop({ required: true }) fullName: string;

  @Prop({ required: true }) line1: string;

  @Prop() line2?: string;

  @Prop({ required: true }) city: string;

  @Prop() county?: string;

  @Prop({ required: true }) postcode: string;

  @Prop({ required: true, default: "United Kingdom" }) country: string;
}
export const OrderAddressSchema = SchemaFactory.createForClass(OrderAddress);

export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "dispatched",
  "delivered",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true, unique: true }) orderNumber: string;

  @Prop({ type: Types.ObjectId, ref: "User" }) user?: Types.ObjectId;

  @Prop({ required: true }) email: string;

  @Prop({ type: [OrderLineSchema], required: true }) items: OrderLine[];

  @Prop({ type: OrderAddressSchema, required: true }) address: OrderAddress;

  @Prop({ required: true }) shippingMethodCode: string;

  @Prop({ required: true }) subtotalMinor: number;

  @Prop({ required: true, default: 0 }) discountMinor: number;

  @Prop({ required: true, default: 0 }) loyaltyDiscountMinor: number;

  @Prop({ required: true }) deliveryMinor: number;

  @Prop({ required: true }) totalMinor: number;

  @Prop({ type: [Object], default: [] }) appliedPromotions: { code: string; label: string; discountMinor: number }[];

  @Prop({ required: true, default: true }) ageVerified: boolean;

  @Prop({ required: true, enum: ORDER_STATUSES, default: "pending_payment" }) status: OrderStatus;

  @Prop() paymentProvider?: string;

  @Prop() paymentIntentId?: string;

  @Prop() paymentStatus?: string;

  @Prop() trackingNumber?: string;

  @Prop({ default: 0 }) loyaltyPointsEarned: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ user: 1, createdAt: -1 });
