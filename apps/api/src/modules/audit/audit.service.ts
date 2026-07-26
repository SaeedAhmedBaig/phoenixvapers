import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AuditEvent } from './schemas/audit-event.schema';

/** Payload for recording one audit event. */
export interface AuditRecord {
  actor: string;
  action: string;
  subjectRef: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

/**
 * Append-only audit writer (spec §4.6).
 *
 * Deliberately exposes a single `record` method — there is no update,
 * no delete, and no way to mutate history through this service. Reading
 * the trail is a separate, permissioned concern (audit explorer, §31).
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditEvent.name)
    private readonly model: Model<AuditEvent>,
  ) {}

  /**
   * Write one immutable audit event.
   *
   * A failed audit write for a compliance-relevant action is itself a
   * serious event — it is logged at error level and re-thrown so callers
   * inside a transaction roll the business change back with it
   * ("no unaudited compliance change" beats "change without evidence").
   */
  async record(event: AuditRecord): Promise<void> {
    try {
      await this.model.create(event);
    } catch (error) {
      this.logger.error(
        `AUDIT WRITE FAILED for ${event.action} on ${event.subjectRef}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
