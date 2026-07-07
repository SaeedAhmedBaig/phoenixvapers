import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ _id: true })
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: "Product", required: true }) product: Types.ObjectId;

  @Prop() strength?: string;

  @Prop({ required: true, min: 1 }) qty: number;
}
export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({ unique: true, sparse: true }) token?: string;

  @Prop({ type: Types.ObjectId, ref: "User", unique: true, sparse: true }) user?: Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] }) items: (CartItem & { _id: Types.ObjectId })[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
