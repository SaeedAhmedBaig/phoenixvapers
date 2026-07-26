import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuditService } from './audit.service';
import { AuditEvent, AuditEventSchema } from './schemas/audit-event.schema';

/**
 * Compliance & Audit context — cross-cutting and privileged (spec §16.2):
 * it observes and records. Global so every module can write audit events
 * without wiring the import each time; the write-only service surface is
 * the protection, not module visibility.
 */
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditEvent.name, schema: AuditEventSchema },
    ]),
  ],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
