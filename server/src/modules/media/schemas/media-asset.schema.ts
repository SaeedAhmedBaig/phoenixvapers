import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class MediaAsset extends Document {
  @Prop({ required: true }) filename: string;

  @Prop({ required: true }) url: string;

  @Prop({ required: true }) mimeType: string;

  @Prop({ required: true }) size: number;

  /** Enforced at upload time — no media asset may be created without alt text. */
  @Prop({ required: true }) altText: string;

  @Prop() uploadedBy?: string;
}

export const MediaAssetSchema = SchemaFactory.createForClass(MediaAsset);
