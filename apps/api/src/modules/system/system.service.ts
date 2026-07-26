import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

import { QUEUES } from '../../common/queues/queues.constants';

/**
 * Public interface of the System module — the only way other modules
 * interact with the `system` queue (spec §16.7: modules expose a narrow
 * provider interface, never their internals).
 */
@Injectable()
export class SystemService {
  constructor(@InjectQueue(QUEUES.SYSTEM) private readonly queue: Queue) {}

  /**
   * Enqueue a heartbeat job.
   * @returns the BullMQ job id assigned to the enqueued job.
   */
  async enqueueHeartbeat(): Promise<string> {
    const job = await this.queue.add(
      'heartbeat',
      { requestedAt: new Date().toISOString() },
      // Completed/failed heartbeats are disposable — don't let them accumulate.
      { removeOnComplete: 100, removeOnFail: 100 },
    );

    return job.id ?? 'unknown';
  }
}
