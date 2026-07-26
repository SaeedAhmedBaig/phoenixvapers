import { Controller, Get, Post } from '@nestjs/common';

import { HealthService } from './health.service';

/**
 * Health endpoints.
 *
 * GET  /v1/health        — liveness + dependency status (Redis, queue worker)
 * POST /v1/health/queue  — enqueue a heartbeat job to exercise BullMQ
 */
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  check() {
    return this.health.check();
  }

  @Post('queue')
  queueCheck() {
    return this.health.queueCheck();
  }
}
