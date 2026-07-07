import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * Config-driven so rule changes (e.g. a future Tobacco and Vapes Bill
 * amendment) do not require a code release — only a data change.
 */
@Schema({ timestamps: true })
export class ComplianceRule extends Document {
  @Prop({ required: true, unique: true }) key: string;

  @Prop({ type: Object, required: true }) value: unknown;

  @Prop() description?: string;
}

export const ComplianceRuleSchema = SchemaFactory.createForClass(ComplianceRule);
