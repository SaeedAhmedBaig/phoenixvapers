import { Test } from '@nestjs/testing';

import { REDIS_CLIENT } from '../../common/redis/redis.constants';
import { SystemService } from '../system/system.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  /** Build the service with controllable fakes for Redis and the queue. */
  async function build(redisFake: Partial<Record<'ping' | 'get', jest.Mock>>) {
    const moduleRef = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: REDIS_CLIENT, useValue: redisFake },
        {
          provide: SystemService,
          useValue: { enqueueHeartbeat: jest.fn().mockResolvedValue('42') },
        },
      ],
    }).compile();

    return moduleRef.get(HealthService);
  }

  it('reports ok with heartbeat when Redis is up', async () => {
    const service = await build({
      ping: jest.fn().mockResolvedValue('PONG'),
      get: jest.fn().mockResolvedValue('2026-07-10T00:00:00.000Z'),
    });

    const result = await service.check();

    expect(result.status).toBe('ok');
    expect(result.services.redis).toBe('up');
    expect(result.services.lastQueueHeartbeat).toBe('2026-07-10T00:00:00.000Z');
  });

  it('reports degraded — not an exception — when Redis is down', async () => {
    const service = await build({
      ping: jest.fn().mockRejectedValue(new Error('ECONNREFUSED')),
    });

    const result = await service.check();

    expect(result.status).toBe('degraded');
    expect(result.services.redis).toBe('down');
  });

  it('enqueues a heartbeat job and returns its id', async () => {
    const service = await build({
      ping: jest.fn().mockResolvedValue('PONG'),
      get: jest.fn().mockResolvedValue(null),
    });

    await expect(service.queueCheck()).resolves.toEqual({
      enqueued: true,
      jobId: '42',
    });
  });
});
