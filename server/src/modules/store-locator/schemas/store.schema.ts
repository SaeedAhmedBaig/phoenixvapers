import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Store extends Document {
  @Prop({ required: true }) name: string;

  @Prop({ required: true }) address1: string;

  @Prop() address2?: string;

  @Prop({ required: true }) city: string;

  @Prop({ required: true, index: true }) postcode: string;

  @Prop({ required: true, default: "United Kingdom" }) country: string;

  @Prop() phone?: string;

  @Prop({ type: [String], default: [] }) services: string[];

  @Prop({ default: false }) isHeadOffice: boolean;

  /** GeoJSON point, ready for a real geocoding pipeline / $near queries later. */
  @Prop({
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] },
  })
  location?: { type: string; coordinates: number[] };
}

export const StoreSchema = SchemaFactory.createForClass(Store);
StoreSchema.index({ location: "2dsphere" });
