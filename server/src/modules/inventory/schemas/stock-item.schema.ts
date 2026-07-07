import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class StockItem extends Document {
  @Prop({ type: Types.ObjectId, ref: "Product", required: true, unique: true }) product: Types.ObjectId;

  @Prop({ required: true, default: 0 }) quantityOnHand: number;

  @Prop({ required: true, default: 0 }) quantityReserved: number;

  @Prop({ default: 10 }) lowStockThreshold: number;
}

export const StockItemSchema = SchemaFactory.createForClass(StockItem);
