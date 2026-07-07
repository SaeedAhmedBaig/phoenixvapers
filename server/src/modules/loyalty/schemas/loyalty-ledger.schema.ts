import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class LoyaltyLedgerEntry extends Document {
  @Prop({ type: Types.ObjectId, ref: "User", required: true }) user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Order" }) order?: Types.ObjectId;

  @Prop({ required: true }) delta: number;

  @Prop({ required: true }) reason: string;

  @Prop({ required: true }) balanceAfter: number;
}

export const LoyaltyLedgerEntrySchema = SchemaFactory.createForClass(LoyaltyLedgerEntry);
LoyaltyLedgerEntrySchema.index({ user: 1, createdAt: -1 });
