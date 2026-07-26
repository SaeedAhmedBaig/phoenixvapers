import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { z } from 'zod';

import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { CurrentCustomer } from '../identity/current-customer.decorator';
import { CustomerAuthGuard } from '../identity/customer-auth.guard';
import type { AuthenticatedCustomer } from '../identity/jwt.strategy';
import { OrdersService } from './orders.service';
import { toOrderDetail, toOrderSummary } from './orders.serializer';

const orderNumberSchema = z.string().regex(/^PHX-\d{1,10}$/);

/** Customer order history (spec §6.1) — always scoped to the requester. */
@Controller('orders')
@UseGuards(CustomerAuthGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  async list(@CurrentCustomer() auth: AuthenticatedCustomer) {
    const orders = await this.orders.listForCustomer(auth.customerId);
    return { items: orders.map(toOrderSummary) };
  }

  @Get(':orderNumber')
  async get(
    @CurrentCustomer() auth: AuthenticatedCustomer,
    @Param('orderNumber', new ZodValidationPipe(orderNumberSchema))
    orderNumber: string,
  ) {
    return toOrderDetail(
      await this.orders.getForCustomer(auth.customerId, orderNumber),
    );
  }
}
