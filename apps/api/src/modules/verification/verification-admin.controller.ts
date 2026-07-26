import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { z } from 'zod';

import { OperatorAuthGuard } from '../identity/operator-auth.guard';
import { CurrentOperator } from '../../common/auth/operator.decorator';
import { RequireRoles } from '../../common/auth/roles.decorator';
import { OperatorRole } from '../../common/auth/roles';
import type { Operator } from '../../common/auth/roles';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { CustomersService } from '../identity/customers.service';
import { VerificationService } from './verification.service';

const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/i, 'invalid id');

const listQuerySchema = z.object({
  status: z
    .enum(['unverified', 'passed', 'failed', 'inconclusive', 'locked'])
    .optional(),
  page: z.coerce.number().int().min(1).max(1_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});
type ListQuery = z.infer<typeof listQuerySchema>;

/**
 * Operator views for verification status and exceptions (Phase 2 prompt).
 * The Compliance Officer works the exception queue (failed, inconclusive,
 * locked) and can unlock after human review — audited, of course.
 * Responses expose account + verification state, never credentials.
 */
@Controller('admin/verification')
@UseGuards(OperatorAuthGuard)
export class VerificationAdminController {
  constructor(
    private readonly customers: CustomersService,
    private readonly verification: VerificationService,
  ) {}

  @Get('customers')
  @RequireRoles(
    OperatorRole.COMPLIANCE_OFFICER,
    OperatorRole.PLATFORM_ADMIN,
    OperatorRole.CUSTOMER_SUPPORT,
  )
  async list(@Query(new ZodValidationPipe(listQuerySchema)) query: ListQuery) {
    const { items, total, counts } = await this.customers.adminList(query);
    return {
      total,
      counts,
      items: items.map((customer) => ({
        id: String(customer._id),
        email: customer.email,
        name: `${customer.firstName} ${customer.lastName}`,
        createdAt: customer.createdAt,
        verification: {
          status: customer.ageVerification?.status ?? 'unverified',
          method: customer.ageVerification?.method,
          verifiedAt: customer.ageVerification?.verifiedAt,
          expiresAt: customer.ageVerification?.expiresAt,
          failedAttempts: customer.ageVerification?.failedAttempts ?? 0,
          evidenceRef: customer.ageVerification?.evidenceRef,
        },
      })),
    };
  }

  @Post(':id/unlock')
  @RequireRoles(OperatorRole.COMPLIANCE_OFFICER)
  unlock(
    @Param('id', new ZodValidationPipe(objectIdSchema)) id: string,
    @CurrentOperator() operator: Operator,
  ) {
    return this.verification.unlock(id, operator.actorId);
  }
}
