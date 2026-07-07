import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Setting extends Document {
  @Prop({ required: true, unique: true }) key: string;

  @Prop({ type: Object, required: true }) value: unknown;

  @Prop() description?: string;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
