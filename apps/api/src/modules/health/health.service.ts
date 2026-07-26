import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { REDIS_CLIENT } from '../../common/redis/redis.constants';
import { HEARTBEAT_KEY } from '../system/system.processor';
import { SystemService } from '../system/system.service';

@Injectable()
export class HealthService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly system: SystemService,
  ) {}

  /**
   * Liveness + dependency report. Redis being down does not throw —
   * the endpoint must stay reachable so monitoring can see WHAT is down.
   */
  async check() {
    let redisStatus: 'up' | 'down' = 'down';
    let lastHeartbeat: string | null = null;

    try {
      await this.redis.ping();
      redisStatus = 'up';
      lastHeartbeat = await this.redis.get(HEARTBEAT_KEY);
    } catch {
      // Reported below as status: "down" — nothing to recover here.
    }

    return {
      status: redisStatus === 'up' ? 'ok' : 'degraded',
      uptimeSeconds: Math.round(process.uptime()),
      services: {
        redis: redisStatus,
        /** Timestamp written by the queue worker — proves BullMQ is processing. */
        lastQueueHeartbeat: lastHeartbeat,
      },
    };
  }

  /** Push a heartbeat job through the system queue (see SystemProcessor). */
  async queueCheck() {
    const jobId = await this.system.enqueueHeartbeat();
    return { enqueued: true, jobId };
  }
}
