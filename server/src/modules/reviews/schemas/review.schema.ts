import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Review extends Document {
  @Prop({ type: Types.ObjectId, ref: "Product", required: true, index: true }) product: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true }) user: Types.ObjectId;

  @Prop({ required: true }) authorName: string;

  @Prop({ required: true, min: 1, max: 5 }) rating: number;

  @Prop({ required: true }) title: string;

  @Prop({ required: true }) body: string;

  @Prop({ default: false }) verifiedPurchase: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
