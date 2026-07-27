import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { z } from 'zod';

import { RequireRoles } from '../../common/auth/roles.decorator';
import { OperatorRole } from '../../common/auth/roles';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { OperatorAuthGuard } from '../identity/operator-auth.guard';
import { OrdersService } from './orders.service';

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const rangeSchema = z.object({
  from: dateStr.optional(),
  to: dateStr.optional(),
});
type RangeQuery = z.infer<typeof rangeSchema>;

/**
 * Reporting surface (spec §28) — Finance & Platform Admin. Read-only
 * aggregates over the orders ledger; the branded PDF versions of these
 * reports render from the same numbers.
 */
@Controller('admin/reports')
@UseGuards(OperatorAuthGuard)
export class ReportsAdminController {
  constructor(private readonly orders: OrdersService) {}

  @Get('sales')
  @RequireRoles(OperatorRole.FINANCE, OperatorRole.PLATFORM_ADMIN)
  sales(@Query(new ZodValidationPipe(rangeSchema)) query: RangeQuery) {
    return this.orders.financeSummary(query.from, query.to);
  }

  /** Order volume by day-of-week × hour-of-day — same role gate as `sales`. */
  @Get('sales-heatmap')
  @RequireRoles(OperatorRole.FINANCE, OperatorRole.PLATFORM_ADMIN)
  salesHeatmap(@Query(new ZodValidationPipe(rangeSchema)) query: RangeQuery) {
    return this.orders.salesHeatmap(query.from, query.to);
  }
}
