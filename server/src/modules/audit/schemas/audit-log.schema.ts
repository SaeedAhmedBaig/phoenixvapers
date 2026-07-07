import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class AuditLog extends Document {
  @Prop() actorId?: string;

  @Prop() actorEmail?: string;

  @Prop({ required: true }) method: string;

  @Prop({ required: true }) path: string;

  @Prop() entityType?: string;

  @Prop() entityId?: string;

  @Prop({ type: Object }) before?: Record<string, unknown>;

  @Prop({ type: Object }) after?: Record<string, unknown>;

  @Prop({ required: true }) statusCode: number;

  @Prop() ip?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });
