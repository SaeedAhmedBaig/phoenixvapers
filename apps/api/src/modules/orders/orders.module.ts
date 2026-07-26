import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuditModule } from '../audit/audit.module';
import { IdentityModule } from '../identity/identity.module';
import { PaymentsModule } from '../payments/payments.module';
import { OrdersAdminController } from './orders-admin.controller';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ReportsAdminController } from './reports-admin.controller';
import {
  Counter,
  CounterSchema,
  Order,
  OrderSchema,
} from './schemas/order.schema';

/**
 * Orders bounded context (spec §7.1) — owns the orders collection and is
 * the sole authority on order state. Checkout (and Phase 4 fulfilment)
 * request transitions through the exported OrdersService.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Counter.name, schema: CounterSchema },
    ]),
    AuditModule,
    IdentityModule,
    PaymentsModule,
  ],
  controllers: [
    OrdersController,
    OrdersAdminController,
    ReportsAdminController,
  ],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
