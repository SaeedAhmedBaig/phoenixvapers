import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { validateEnv } from './common/config/env.validation';
import { RedisModule } from './common/redis/redis.module';
import { AuditModule } from './modules/audit/audit.module';
import { CartModule } from './modules/cart/cart.module';
import { CatalogueModule } from './modules/catalogue/catalogue.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { HealthModule } from './modules/health/health.module';
import { IdentityModule } from './modules/identity/identity.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { SearchModule } from './modules/search/search.module';
import { SystemModule } from './modules/system/system.module';
import { VerificationModule } from './modules/verification/verification.module';

/**
 * Root module of the Phoenix Vapers API — a NestJS modular monolith
 * (spec §16.1/§16.7): one deployable, one feature module per bounded
 * context, communicating only through provider interfaces and events.
 *
 * MongoDB is registered only when MONGODB_URI is configured, so the
 * Phase 0 skeleton boots on machines where the database server is not
 * yet provisioned. From Phase 1 the URI is required (see env.validation).
 */
@Module({
  imports: [
    // Environment: loaded once, validated with Zod, refused if invalid (§16.9).
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),

    // BullMQ — Redis-backed background jobs (§16.3). Workers require
    // maxRetriesPerRequest: null, hence a dedicated connection instead of
    // the shared client from RedisModule.
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.getOrThrow<string>('REDIS_URL'),
          maxRetriesPerRequest: null,
        },
      }),
    }),

    // MongoDB via Mongoose — conditional until the server is provisioned.
    ...(process.env.MONGODB_URI
      ? [
          MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
              uri: config.getOrThrow<string>('MONGODB_URI'),
            }),
          }),
        ]
      : []),

    // Rate limiting on every public endpoint (spec §16.4) — per-IP,
    // 120 requests per minute. Compliance-critical endpoints tighten
    // this further in later phases.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),

    // Shared infrastructure.
    RedisModule,

    // Feature modules — one per bounded context (§16.2). More arrive per phase.
    SystemModule,
    HealthModule,
    AuditModule,
    CatalogueModule,
    SearchModule,
    IdentityModule,
    VerificationModule,
    PricingModule,
    CartModule,
    PaymentsModule,
    OrdersModule,
    CheckoutModule,
  ],
  providers: [
    // Global guard: throttling applies unless a route opts out explicitly.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
