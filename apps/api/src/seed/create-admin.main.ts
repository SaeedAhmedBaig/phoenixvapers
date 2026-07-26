/**
 * Bootstrap a staff account — `pnpm create-admin` (spec §3.2).
 *
 * The one privileged path that does not itself require an operator: it
 * exists to create the FIRST platform admin (and is handy for provisioning
 * staff from the CLI). Everything else — staff created through the console —
 * goes through an authenticated platform admin.
 *
 * Usage:
 *   pnpm --filter api create-admin -- \
 *     --email ops@phoenix.dev --password 'Str0ngPass!' \
 *     --first Ada --last Ops --role platform_admin
 *
 * Roles: merchandiser | compliance_officer | platform_admin (default).
 */
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { AppModule } from '../app.module';
import { OperatorRole } from '../common/auth/roles';
import { ensureResolvableDns } from '../common/bootstrap/ensure-dns';
import { OperatorsService } from '../modules/identity/operators.service';

/** Parse `--key value` pairs from argv into a plain object. */
function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i += 1;
      } else {
        args[key] = 'true';
      }
    }
  }
  return args;
}

async function main(): Promise<void> {
  const logger = new Logger('CreateAdmin');
  ensureResolvableDns();

  const args = parseArgs(process.argv.slice(2));
  const email = args.email?.toLowerCase().trim();
  const password = args.password;
  const firstName = args.first ?? args.firstName ?? 'Phoenix';
  const lastName = args.last ?? args.lastName ?? 'Operator';
  const roleArg = (args.role ?? OperatorRole.PLATFORM_ADMIN) as OperatorRole;

  if (!email || !password) {
    throw new Error(
      'Required: --email <address> --password <password> ' +
        '[--first <name> --last <name> --role <role>]',
    );
  }
  if (password.length < 10) {
    throw new Error('Password must be at least 10 characters');
  }
  if (!Object.values(OperatorRole).includes(roleArg)) {
    throw new Error(
      `Unknown role "${roleArg}". Use one of: ${Object.values(OperatorRole).join(', ')}`,
    );
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  try {
    const operators = app.get(OperatorsService);
    const created = await operators.create(
      { email, password, firstName, lastName, role: roleArg },
      'bootstrap',
    );
    logger.log(`Created ${created.role}: ${created.email} (${created.id})`);
    logger.log('They can now sign in at the storefront /login.');
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error('create-admin failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
