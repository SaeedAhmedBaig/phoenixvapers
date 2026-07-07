import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Promotion extends Document {
  @Prop({ required: true, unique: true }) code: string;

  @Prop({ required: true }) label: string;

  @Prop({ required: true, enum: ["bundle", "percentage"] }) type: string;

  @Prop({ type: [String], default: [] }) matchBrandSlugs: string[];

  @Prop({ type: [String], default: [] }) matchCategorySlugs: string[];

  /** Bundle: { buyQty, forPriceMinor }. Percentage: { percentageOff }. */
  @Prop({ type: Object, required: true }) config: Record<string, number>;

  @Prop({ default: true }) active: boolean;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
