import dns from 'node:dns';

import { Logger } from '@nestjs/common';

/**
 * Local-dev DNS self-heal, shared by every process that opens a Mongo
 * connection (the API server AND the seed CLI).
 *
 * On some Windows machines Node's c-ares resolver reports a loopback-only
 * DNS server (127.0.0.1) with nothing listening, so `mongodb+srv://` SRV
 * lookups fail with ECONNREFUSED even though the OS resolver works fine.
 * When that broken state is detected in development, fall back to public
 * DNS so Atlas connects.
 *
 * NEVER touches production: a loopback resolver there (e.g. systemd-resolved
 * at 127.0.0.53) is legitimate and must be left alone.
 */
export function ensureResolvableDns(): void {
  if (process.env.NODE_ENV === 'production') return;

  const servers = dns.getServers();
  const loopbackOnly =
    servers.length > 0 &&
    servers.every((s) => s.startsWith('127.') || s === '::1');

  if (loopbackOnly) {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
    new Logger('Bootstrap').warn(
      'DNS resolver was loopback-only; using public DNS for this dev session.',
    );
  }
}
