import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { OperatorRole } from '../../../common/auth/roles';

/**
 * Operator collection (spec §3.2) — staff accounts (merchandiser,
 * compliance officer, platform admin) that sign in through the SAME
 * `/auth/login` as customers. Kept in a separate collection from customers
 * so the two principal types never blur: a customer record can never gain
 * a role, and an operator never carries shopper data (addresses, consents,
 * age verification).
 *
 * Security: created ONLY by a platform admin (or the one-time bootstrap
 * CLI) — never through public sign-up. argon2id at rest, same as customers.
 */
@Schema({ collection: 'operators', timestamps: true, strict: 'throw' })
export class Operator {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  /** argon2id hash — never a reversible or fast hash. */
  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(OperatorRole),
    index: true,
  })
  role!: OperatorRole;

  /** Suspended operators fail login closed — access is revoked, not deleted. */
  @Prop({ type: String, enum: ['active', 'suspended'], default: 'active' })
  status!: string;

  @Prop({ default: 1 })
  schemaVersion!: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export type OperatorDocument = HydratedDocument<Operator>;
export const OperatorSchema = SchemaFactory.createForClass(Operator);
