import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ROLE_NAMES } from "../../../common/constants/permissions";

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true }) email: string;

  @Prop({ required: true }) passwordHash: string;

  @Prop({ required: true }) name: string;

  @Prop() phone?: string;

  @Prop({ default: ROLE_NAMES.CUSTOMER }) role: string;

  /** Brand IDs this user (brand-partner) may act on. Empty for other roles. */
  @Prop({ type: [Types.ObjectId], default: [], ref: "Brand" }) brandScope: Types.ObjectId[];

  @Prop({ default: true }) active: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
