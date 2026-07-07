import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Permission extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ['orders', 'products', 'customers', 'analytics', 'staff', 'settings', 'marketing'] })
  category: string;

  @Prop({ default: false })
  isBuiltIn: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
