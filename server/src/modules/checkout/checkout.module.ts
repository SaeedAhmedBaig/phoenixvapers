import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Order, OrderSchema } from "./schemas/order.schema";
import { Counter, CounterSchema } from "./schemas/counter.schema";
import { OrdersService } from "./orders.service";
import { CheckoutService } from "./checkout.service";
import { CheckoutController } from "./checkout.controller";
import { OrdersController } from "./orders.controller";
import { CartModule } from "../cart/cart.module";
import { ComplianceModule } from "../compliance/compliance.module";
import { InventoryModule } from "../inventory/inventory.module";
import { PaymentsModule } from "../payments/payments.module";
import { LoyaltyModule } from "../loyalty/loyalty.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Counter.name, schema: CounterSchema },
    ]),
    CartModule,
    ComplianceModule,
    InventoryModule,
    PaymentsModule,
    LoyaltyModule,
    NotificationsModule,
  ],
  controllers: [CheckoutController, OrdersController],
  providers: [OrdersService, CheckoutService],
  exports: [OrdersService, MongooseModule],
})
export class CheckoutModule {}
