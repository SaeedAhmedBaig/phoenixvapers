import { Module } from '@nestjs/common';

import { SystemModule } from '../system/system.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

/** Health module — liveness, dependency status, and queue smoke-test. */
@Module({
  imports: [SystemModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
