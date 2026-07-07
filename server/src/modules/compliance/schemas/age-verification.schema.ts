import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class AgeVerification extends Document {
  @Prop() userId?: string;

  @Prop({ required: true }) subjectKey: string; // userId or anonymous session token

  @Prop({ required: true, enum: ["provider", "self-declared"] }) method: string;

  @Prop() provider?: string;

  @Prop({ required: true }) passed: boolean;
}

export const AgeVerificationSchema = SchemaFactory.createForClass(AgeVerification);
AgeVerificationSchema.index({ subjectKey: 1, createdAt: -1 });
