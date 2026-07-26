/**
 * Canonical BullMQ queue names (spec §16.3 — background jobs: subscriptions,
 * dunning, reconciliation, notifications...).
 *
 * Every queue the platform uses MUST be declared here so names are never
 * duplicated as string literals across modules.
 */
export const QUEUES = {
  /** Platform housekeeping: heartbeats, cleanups, scheduled maintenance. */
  SYSTEM: 'system',
  /** Age-verification lifecycle: pass-expiry sweeps (spec §4.2). */
  VERIFICATION: 'verification',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];
