import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Permission } from './permission.schema';

@Schema({ timestamps: true })
export class Role extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [Types.ObjectId], ref: 'Permission', default: [] })
  permissions: Permission[];

  @Prop({ default: false })
  isBuiltIn: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, enum: ['super-admin', 'brand-partner', 'staff', 'staff-junior', 'custom'], required: true })
  type: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
