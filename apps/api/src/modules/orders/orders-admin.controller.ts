import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';

import { CurrentOperator } from '../../common/auth/operator.decorator';
import { RequireRoles } from '../../common/auth/roles.decorator';
import { RequirePermission } from '../../common/auth/permissions.decorator';
import { OperatorRole } from '../../common/auth/roles';
import type { Operator } from '../../common/auth/roles';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { OperatorAuthGuard } from '../identity/operator-auth.guard';
import { OrdersService } from './orders.service';
import { toAdminOrderDetail, toAdminOrderSummary } from './orders.serializer';
import { OrderStatus } from './schemas/order.schema';

const cancelSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});
type CancelBody = z.infer<typeof cancelSchema>;

const orderNumberSchema = z.string().regex(/^PHX-\d{1,10}$/);

const listQuerySchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  q: z.string().trim().min(1).max(80).optional(),
  page: z.coerce.number().int().min(1).max(1_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});
type ListQuery = z.infer<typeof listQuerySchema>;

/**
 * Order-management console (spec §7.3). Operator surface — the customer
 * order routes stay scoped to the requester; these read across ALL orders
 * and expose operational detail (payment, verification evidence, attributed
 * timeline). Gated to platform admins for now; a dedicated operations/CS
 * role joins the policy as fulfilment lands in Phase 4.
 */
@Controller('admin/orders')
@UseGuards(OperatorAuthGuard)
export class OrdersAdminController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  @RequireRoles(
    OperatorRole.PLATFORM_ADMIN,
    OperatorRole.CUSTOMER_SUPPORT,
    OperatorRole.FINANCE,
  )
  @RequirePermission('order:read')
  async list(@Query(new ZodValidationPipe(listQuerySchema)) query: ListQuery) {
    const { items, total, counts } = await this.orders.adminList(query);
    return { total, counts, items: items.map(toAdminOrderSummary) };
  }

  @Get(':orderNumber')
  @RequireRoles(
    OperatorRole.PLATFORM_ADMIN,
    OperatorRole.CUSTOMER_SUPPORT,
    OperatorRole.FINANCE,
  )
  @RequirePermission('order:read')
  async get(
    @Param('orderNumber', new ZodValidationPipe(orderNumberSchema))
    orderNumber: string,
  ) {
    return toAdminOrderDetail(await this.orders.adminGetByNumber(orderNumber));
  }

  /* ─────────────────── controlled actions (§7.3) ──────────────────── */

  /** Pause fulfilment — support & admin (no money moves). */
  @Post(':orderNumber/hold')
  @RequireRoles(OperatorRole.PLATFORM_ADMIN, OperatorRole.CUSTOMER_SUPPORT)
  @RequirePermission('order:hold')
  async hold(
    @Param('orderNumber', new ZodValidationPipe(orderNumberSchema)) orderNumber: string,
    @CurrentOperator() actor: Operator,
  ) {
    return toAdminOrderDetail(
      (await this.orders.hold(orderNumber, actor.actorId)).toObject(),
    );
  }

  @Post(':orderNumber/release')
  @RequireRoles(OperatorRole.PLATFORM_ADMIN, OperatorRole.CUSTOMER_SUPPORT)
  @RequirePermission('order:release')
  async release(
    @Param('orderNumber', new ZodValidationPipe(orderNumberSchema)) orderNumber: string,
    @CurrentOperator() actor: Operator,
  ) {
    return toAdminOrderDetail(
      (await this.orders.release(orderNumber, actor.actorId)).toObject(),
    );
  }

  /** Cancel + refund — a money action, so finance & admin only. */
  @Post(':orderNumber/cancel')
  @RequireRoles(OperatorRole.PLATFORM_ADMIN, OperatorRole.FINANCE)
  async cancel(
    @Param('orderNumber', new ZodValidationPipe(orderNumberSchema)) orderNumber: string,
    @Body(new ZodValidationPipe(cancelSchema)) dto: CancelBody,
    @CurrentOperator() actor: Operator,
  ) {
    return toAdminOrderDetail(
      (await this.orders.cancel(orderNumber, actor.actorId, dto.reason)).toObject(),
    );
  }
}
