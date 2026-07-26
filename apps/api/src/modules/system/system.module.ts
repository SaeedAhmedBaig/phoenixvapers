import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { QUEUES } from '../../common/queues/queues.constants';
import { SystemProcessor } from './system.processor';
import { SystemService } from './system.service';

/**
 * System module — platform housekeeping jobs (heartbeats, cleanups).
 * Owns the `system` BullMQ queue and its worker.
 */
@Module({
  imports: [BullModule.registerQueue({ name: QUEUES.SYSTEM })],
  providers: [SystemService, SystemProcessor],
  exports: [SystemService],
})
export class SystemModule {}
