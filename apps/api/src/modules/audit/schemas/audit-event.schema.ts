import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * Immutable audit event (spec §4.6 / §18 `auditEvents`).
 *
 * Append-only and tamper-evident: the AuditService exposes writes only,
 * documents are never updated or deleted, and the schema is saved with
 * strict mode so no stray fields slip in.
 */
@Schema({
  collection: 'auditEvents',
  // No updatedAt on purpose — audit events are written exactly once.
  timestamps: { createdAt: 'at', updatedAt: false },
  strict: 'throw',
})
export class AuditEvent {
  /** Who acted — operator actorId, 'system', or (later) a customer id. */
  @Prop({ required: true, index: true })
  actor!: string;

  /** Machine-readable action, e.g. 'catalogue.product.published'. */
  @Prop({ required: true, index: true })
  action!: string;

  /** What was acted on, e.g. 'product:664f…' — collection-qualified id. */
  @Prop({ required: true, index: true })
  subjectRef!: string;

  /** State before the change (relevant fields only, never secrets). */
  @Prop({ type: Object })
  before?: Record<string, unknown>;

  /** State after the change (relevant fields only, never secrets). */
  @Prop({ type: Object })
  after?: Record<string, unknown>;
}

export type AuditEventDocument = HydratedDocument<AuditEvent>;
export const AuditEventSchema = SchemaFactory.createForClass(AuditEvent);
