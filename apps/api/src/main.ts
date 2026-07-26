import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import mongoose from 'mongoose';

import { AppModule } from './app.module';
import { ensureResolvableDns } from './common/bootstrap/ensure-dns';

// Must run before any Mongo connection is opened (see helper for details).
ensureResolvableDns();

// Defence in depth for every Mongoose query in the process:
//  - sanitizeFilter neutralises operator-injection ($gt, $where…) should
//    unvalidated input ever reach a query filter;
//  - strictQuery drops filter fields that are not in the schema.
mongoose.set('sanitizeFilter', true);
mongoose.set('strictQuery', true);

/**
 * API bootstrap (spec §16.7 — global pipes, OpenAPI, and telemetry are
 * added here as the platform grows).
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Security response headers (HSTS, frame-deny, nosniff, …) — spec §16.4.
  app.use(helmet());

  // REST endpoints are versioned from day one: /v1/... (spec §19.1).
  app.setGlobalPrefix('v1');

  // The storefront (which now hosts the admin console at /admin) is the only
  // browser origin allowed to call the API.
  app.enableCors({
    origin: [config.getOrThrow<string>('WEB_ORIGIN')],
    credentials: true,
  });

  // Ensure onApplicationShutdown hooks run (Redis/queue connections close cleanly).
  app.enableShutdownHooks();

  const port = config.getOrThrow<number>('API_PORT');
  await app.listen(port);

  new Logger('Bootstrap').log(
    `Phoenix API listening on http://localhost:${port}/v1`,
  );
}

void bootstrap();
