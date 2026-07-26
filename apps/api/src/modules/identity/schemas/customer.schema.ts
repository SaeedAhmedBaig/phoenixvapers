import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * Customer collection (spec §18 `customers`).
 *
 * Data minimisation (§16.5): no identity documents, no verification raw
 * data — only the OUTCOME of age verification with an opaque evidence
 * reference into the provider's system. Payment data never appears here
 * (tokens only, and not before Phase 3).
 */

export enum AgeVerificationStatus {
  UNVERIFIED = 'unverified',
  PASSED = 'passed',
  FAILED = 'failed',
  INCONCLUSIVE = 'inconclusive',
  /** Soft-locked after repeated failures — human review required (§4.2). */
  LOCKED = 'locked',
}

@Schema({ _id: false })
class AgeVerification {
  @Prop({
    type: String,
    enum: Object.values(AgeVerificationStatus),
    default: AgeVerificationStatus.UNVERIFIED,
  })
  status!: AgeVerificationStatus;

  /** 'electronic' (database check) or 'document' (escalation path). */
  @Prop()
  method?: string;

  /** Opaque reference into the provider's records — never raw documents. */
  @Prop()
  evidenceRef?: string;

  @Prop()
  verifiedAt?: Date;

  /** A pass expires; renewal is re-verification (§4.2 retention rules). */
  @Prop()
  expiresAt?: Date;

  /** Failed attempts since the last pass — drives the soft lock. */
  @Prop({ default: 0 })
  failedAttempts!: number;
}

@Schema({ _id: false })
class Address {
  @Prop({ required: true })
  label!: string;

  @Prop({ required: true })
  line1!: string;

  @Prop()
  line2?: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ required: true })
  postcode!: string;

  @Prop({ default: 'GB' })
  country!: string;
}

@Schema({ _id: false })
class Consents {
  /** Lawful, auditable marketing opt-in (§4.5) — default OFF, always. */
  @Prop({ default: false })
  marketingEmail!: boolean;

  @Prop()
  marketingEmailAt?: Date;
}

@Schema({ collection: 'customers', timestamps: true, strict: 'throw' })
export class Customer {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  /** argon2id hash — never a reversible or fast hash (§6.1). */
  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  /** Needed for electronic age checks and pass renewal. */
  @Prop({ required: true })
  dateOfBirth!: Date;

  @Prop({ type: String, enum: ['active', 'locked'], default: 'active' })
  status!: string;

  /** Set by the Phase 7 comms stack; informational until then. */
  @Prop({ default: false })
  emailVerified!: boolean;

  @Prop({ type: AgeVerification, default: {} })
  ageVerification!: AgeVerification;

  @Prop({ type: [Address], default: [] })
  addresses!: Address[];

  @Prop({ type: Consents, default: {} })
  consents!: Consents;

  @Prop({ default: 1 })
  schemaVersion!: number;

  /** Managed by `{ timestamps: true }` — declared for type visibility. */
  createdAt?: Date;
  updatedAt?: Date;
}

export type CustomerDocument = HydratedDocument<Customer>;
export const CustomerSchema = SchemaFactory.createForClass(Customer);

// Indexes per spec §18: unique email (declared on @Prop), verification
// status/expiry for operator queues and the renewal/purge jobs.
CustomerSchema.index({ 'ageVerification.status': 1 });
CustomerSchema.index({ 'ageVerification.expiresAt': 1 });
