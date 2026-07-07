import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class ShippingMethod extends Document {
  @Prop({ required: true, unique: true }) code: string;

  @Prop({ required: true }) label: string;

  @Prop({ required: true }) priceMinor: number;

  @Prop() freeThresholdMinor?: number;

  @Prop({ required: true }) etaLabel: string;

  @Prop({ default: true }) active: boolean;
}

export const ShippingMethodSchema = SchemaFactory.createForClass(ShippingMethod);
