import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * Rotating refresh tokens (spec §16.3 — JWT access + refresh).
 *
 * Only the SHA-256 hash of a token is stored; possession of the database
 * never grants a session. Rotation chain: using a token revokes it and
 * records its replacement — if a REVOKED token is ever presented again
 * (theft indicator), every session for that customer is revoked.
 */
@Schema({ collection: 'refreshTokens', timestamps: true, strict: 'throw' })
export class RefreshToken {
  /**
   * The principal that owns this session. The field is named `customerId`
   * for history; `principalType` disambiguates whether the id refers to a
   * customer or an operator, so both share one rotation/reuse mechanism.
   */
  @Prop({ type: Types.ObjectId, required: true, index: true })
  customerId!: Types.ObjectId;

  @Prop({ type: String, enum: ['customer', 'operator'], default: 'customer' })
  principalType!: string;

  @Prop({ required: true, unique: true })
  tokenHash!: string;

  /** TTL index below reaps expired documents automatically. */
  @Prop({ required: true })
  expiresAt!: Date;

  @Prop()
  revokedAt?: Date;

  @Prop()
  replacedByHash?: string;
}

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;
export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
