/**
 * Injection token for the shared ioredis client.
 * Inject with `@Inject(REDIS_CLIENT)` — never construct ad-hoc connections
 * inside feature modules; one client is shared platform-wide.
 */
export const REDIS_CLIENT = Symbol('REDIS_CLIENT');
