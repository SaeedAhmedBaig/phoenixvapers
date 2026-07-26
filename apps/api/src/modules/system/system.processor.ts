import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import Redis from 'ioredis';

import { QUEUES } from '../../common/queues/queues.constants';
import { REDIS_CLIENT } from '../../common/redis/redis.constants';

/** Redis key holding the timestamp of the last processed heartbeat job. */
export const HEARTBEAT_KEY = 'system:heartbeat:last';

/**
 * Worker for the `system` queue.
 *
 * The heartbeat job exists to prove the full BullMQ pipeline end to end
 * (enqueue → Redis → worker → result) and gives the health endpoint a
 * live signal that background processing is running.
 */
@Processor(QUEUES.SYSTEM)
export class SystemProcessor extends WorkerHost {
  private readonly logger = new Logger(SystemProcessor.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case 'heartbeat': {
        const at = new Date().toISOString();
        await this.redis.set(HEARTBEAT_KEY, at);
        this.logger.log(`Heartbeat processed (job ${job.id}) at ${at}`);
        return { at };
      }

      default:
        // Unknown jobs are a programming error — fail loudly, never silently.
        throw new Error(
          `Unknown job "${job.name}" on queue "${QUEUES.SYSTEM}"`,
        );
    }
  }
}
