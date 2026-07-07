import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class LoyaltyAccount extends Document {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, unique: true }) user: Types.ObjectId;

  @Prop({ required: true, default: 0 }) pointsBalance: number;
}

export const LoyaltyAccountSchema = SchemaFactory.createForClass(LoyaltyAccount);
