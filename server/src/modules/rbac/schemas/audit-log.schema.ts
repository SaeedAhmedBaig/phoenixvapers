import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true })
  action: string; // e.g., "order.refund", "product.create", "staff.permission.update"

  @Prop({ type: String, enum: ['create', 'read', 'update', 'delete', 'export'], required: true })
  actionType: string;

  @Prop({ type: String, enum: ['orders', 'products', 'customers', 'staff', 'settings', 'analytics'], required: true })
  resource: string;

  @Prop({ type: Types.ObjectId })
  resourceId: Types.ObjectId;

  @Prop({ type: Object })
  oldValues: Record<string, any>;

  @Prop({ type: Object })
  newValues: Record<string, any>;

  @Prop()
  description: string;

  @Prop({ type: String, enum: ['success', 'failure'] })
  status: string;

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });
