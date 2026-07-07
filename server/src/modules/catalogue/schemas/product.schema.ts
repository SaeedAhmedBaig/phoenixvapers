import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true, unique: true }) slug: string;

  @Prop({ required: true }) name: string;

  @Prop({ type: Types.ObjectId, ref: "Brand", required: true }) brand: Types.ObjectId;

  @Prop({ required: true }) brandName: string;

  @Prop({ required: true, index: true }) brandSlug: string;

  @Prop({ type: Types.ObjectId, ref: "Category", required: true }) category: Types.ObjectId;

  @Prop({ required: true, index: true }) categorySlug: string;

  /** Merchandising tag (e.g. "best-sellers", "new-arrivals"). Named collectionTag because
   * Document already defines a `collection` property for the underlying MongoDB collection. */
  @Prop({ required: true, index: true }) collectionTag: string;

  @Prop({ required: true }) format: string;

  @Prop() flavour?: string;

  @Prop() draw?: string;

  @Prop({ required: true }) strength: string;

  @Prop({ required: true }) priceMinor: number;

  @Prop() compareAtMinor?: number;

  @Prop() badge?: string;

  /** Primary product photo (served from /uploads via the Media module). */
  @Prop() imageUrl?: string;

  /** Additional gallery photos shown on the product detail page. */
  @Prop({ type: [String], default: [] }) galleryUrls: string[];

  /** Highest nicotine strength (mg/ml) represented by this listing, used by the Compliance module. */
  @Prop() nicotineMg?: number;

  @Prop({ required: true }) description: string;

  @Prop({ type: [String], default: [] }) notes: string[];

  @Prop({ default: 0 }) ratingAvg: number;

  @Prop({ default: 0 }) ratingCount: number;

  @Prop({ enum: ["in", "low", "out"], default: "in" }) stockStatus: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ name: "text", brandName: "text", flavour: "text", description: "text" });
