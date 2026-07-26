import { InjectQueue } from '@nestjs/bullmq';
import { BullModule } from '@nestjs/bullmq';
import { Module, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';

import { QUEUES } from '../../common/queues/queues.constants';
import { IdentityModule } from '../identity/identity.module';
import { MockAvAdapter } from './adapters/mock-av.adapter';
import { VerificationAdminController } from './verification-admin.controller';
import { VerificationController } from './verification.controller';
import { AGE_VERIFICATION_PORT } from './verification.port';
import { VerificationProcessor } from './verification.processor';
import { VerificationService } from './verification.service';

/**
 * Age Verification bounded context (spec §4.2) [COMPLIANCE].
 * The provider binding is the only place that knows WHICH provider
 * answers — a real provider adapter replaces MockAvAdapter without any
 * domain change. Nightly pass-expiry runs via a BullMQ job scheduler.
 */
@Module({
  imports: [
    IdentityModule,
    BullModule.registerQueue({ name: QUEUES.VERIFICATION }),
  ],
  controllers: [VerificationController, VerificationAdminController],
  providers: [
    VerificationService,
    VerificationProcessor,
    { provide: AGE_VERIFICATION_PORT, useClass: MockAvAdapter },
  ],
  exports: [VerificationService],
})
export class VerificationModule implements OnModuleInit {
  constructor(
    @InjectQueue(QUEUES.VERIFICATION) private readonly queue: Queue,
  ) {}

  /** Idempotent nightly schedule — 03:00 server time, one sweep. */
  async onModuleInit(): Promise<void> {
    await this.queue.upsertJobScheduler(
      'expire-av-passes',
      { pattern: '0 3 * * *' },
      { name: 'expire-passes' },
    );
  }
}
