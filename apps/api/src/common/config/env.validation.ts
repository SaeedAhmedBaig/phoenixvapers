import { z } from 'zod';

/**
 * Boot-time environment validation (spec §16.9).
 *
 * Every variable the API reads is declared here. The app REFUSES TO START
 * if required configuration is missing or malformed — configuration errors
 * must surface at deploy time, never at request time.
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  /** Port the NestJS API listens on. */
  API_PORT: z.coerce.number().int().positive().default(4000),

  /** Redis — cache, sessions, rate-limits, and BullMQ job queues. */
  REDIS_URL: z.string().default('redis://127.0.0.1:6379'),

  /**
   * MongoDB replica-set connection string.
   * Optional during Phase 0 (server not provisioned yet) — the Mongoose
   * connection is only registered when this is present. It becomes
   * REQUIRED from Phase 1 (catalogue) onward.
   */
  MONGODB_URI: z.string().optional(),

  /**
   * Allowed browser origin for CORS. The admin console is served from this
   * same origin under /admin, so there is no separate admin origin.
   */
  WEB_ORIGIN: z.string().default('http://localhost:3000'),

  /* ── Customer auth (Phase 2, spec §16.3) ─────────────────────────── */

  /** Signs customer JWTs. >= 32 chars of randomness; never defaulted. */
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be >= 32 chars'),
  /** Access-token lifetime — short by design; refresh does the living. */
  JWT_ACCESS_TTL_SECONDS: z.coerce
    .number()
    .int()
    .min(60)
    .max(3600)
    .default(900),
  /** Rotating refresh-token lifetime. */
  REFRESH_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(30),

  /* ── Age verification (Phase 2, spec §4.2) [COMPLIANCE] ──────────── */

  /** Provider adapter behind AGE_VERIFICATION_PORT. Real provider later. */
  AV_PROVIDER: z.enum(['mock']).default('mock'),
  /**
   * Fault injection for QA (spec §16.11): 'outage' makes the provider
   * unavailable so the fail-closed path can be exercised deliberately.
   */
  AV_FAULT_MODE: z.enum(['outage']).optional(),
  /** How long a verification pass remains valid before re-verification. */
  AV_PASS_TTL_DAYS: z.coerce.number().int().min(30).max(1095).default(365),

  /* ── Pricing, tax & duty (Phase 3, spec §4.4/§6.5) [COMPLIANCE] ──── */

  /**
   * Vaping Products Duty in pence per 10 ml (or part thereof), applied to
   * ALL vaping liquid including 0 mg. Statutory default £2.20 from
   * 1 Oct 2026. A rate change is an env change with an audit trail — never
   * a code change.
   */
  VPD_DUTY_MINOR_PER_10ML: z.coerce.number().int().min(0).default(220),
  /** VAT rate in basis points (2000 = 20%). */
  VAT_RATE_BP: z.coerce.number().int().min(0).max(10_000).default(2000),

  /* ── Payments (Phase 3, spec §6.4) ───────────────────────────────── */

  /** PSP adapter behind PAYMENT_PORT. Real PCI-DSS provider later. */
  PSP_PROVIDER: z.enum(['mock']).default('mock'),
  /**
   * Fault injection for QA (spec §16.11): 'outage' makes the PSP
   * unavailable so checkout's fail-closed path can be exercised.
   */
  PSP_FAULT_MODE: z.enum(['outage']).optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Passed to `ConfigModule.forRoot({ validate })`. Throws with a readable,
 * per-variable report when the environment is invalid.
 */
export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const report = result.error.issues
      .map(
        (issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`,
      )
      .join('\n');

    throw new Error(`Invalid environment configuration:\n${report}`);
  }

  return result.data;
}
