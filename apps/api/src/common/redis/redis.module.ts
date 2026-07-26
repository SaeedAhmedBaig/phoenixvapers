import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { REDIS_CLIENT } from './redis.constants';

/**
 * Shared Redis connection (spec §16.3 — cache, sessions, rate-limits,
 * hot reads). Global so feature modules inject the client without each
 * importing this module explicitly.
 *
 * Note: BullMQ maintains its own connections (see AppModule) because
 * queue connections require `maxRetriesPerRequest: null`, which is not
 * appropriate for general-purpose commands.
 */
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Redis(config.getOrThrow<string>('REDIS_URL'), {
          // Fail fast in dev if Redis is down rather than retrying forever.
          maxRetriesPerRequest: 3,
        }),
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  /** Close the connection cleanly so watch-mode restarts don't leak sockets. */
  async onApplicationShutdown(): Promise<void> {
    await this.client.quit();
  }
}
