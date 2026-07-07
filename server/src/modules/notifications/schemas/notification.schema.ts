import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Notification extends Document {
  @Prop() userId?: string;

  @Prop({ required: true }) email: string;

  @Prop({ required: true }) type: string;

  @Prop({ type: Object, required: true }) payload: Record<string, unknown>;

  @Prop({ required: true, enum: ["sent", "failed"] }) status: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
