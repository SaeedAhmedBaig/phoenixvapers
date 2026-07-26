import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';

import { CurrentOperator } from '../../common/auth/operator.decorator';
import { RequireRoles } from '../../common/auth/roles.decorator';
import { OperatorRole } from '../../common/auth/roles';
import type { Operator } from '../../common/auth/roles';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { OperatorAuthGuard } from './operator-auth.guard';
import { OperatorsService } from './operators.service';
import type { OperatorDocument } from './schemas/operator.schema';

const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/i, 'invalid id');

/** Create-staff payload — password policy mirrors the bootstrap CLI. */
const createOperatorSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(10).max(200),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  role: z.nativeEnum(OperatorRole),
});
type CreateOperatorBody = z.infer<typeof createOperatorSchema>;

/** Public projection — never leaks the password hash. */
function toPublicOperator(op: OperatorDocument) {
  return {
    id: String(op._id),
    email: op.email,
    firstName: op.firstName,
    lastName: op.lastName,
    role: op.role,
    status: op.status,
    createdAt: op.createdAt,
  };
}

/**
 * Staff administration (spec §3.2) — PLATFORM ADMIN ONLY. This is the
 * console path that replaces seeded/dummy operators: real staff accounts
 * are created here, by a named platform admin, fully audited. Merchandisers
 * and compliance officers cannot reach it (closed by default + role check).
 */
@Controller('admin/operators')
@UseGuards(OperatorAuthGuard)
export class OperatorAdminController {
  constructor(private readonly operators: OperatorsService) {}

  @Get()
  @RequireRoles(OperatorRole.PLATFORM_ADMIN)
  async list() {
    const operators = await this.operators.list();
    return { items: operators.map(toPublicOperator) };
  }

  @Post()
  @RequireRoles(OperatorRole.PLATFORM_ADMIN)
  async create(
    @Body(new ZodValidationPipe(createOperatorSchema)) dto: CreateOperatorBody,
    @CurrentOperator() actor: Operator,
  ) {
    const created = await this.operators.create(dto, actor.actorId);
    return toPublicOperator(created);
  }

  @Post(':id/suspend')
  @RequireRoles(OperatorRole.PLATFORM_ADMIN)
  async suspend(
    @Param('id', new ZodValidationPipe(objectIdSchema)) id: string,
    @CurrentOperator() actor: Operator,
  ) {
    return toPublicOperator(
      await this.operators.setStatus(id, 'suspended', actor.actorId),
    );
  }

  @Post(':id/activate')
  @RequireRoles(OperatorRole.PLATFORM_ADMIN)
  async activate(
    @Param('id', new ZodValidationPipe(objectIdSchema)) id: string,
    @CurrentOperator() actor: Operator,
  ) {
    return toPublicOperator(
      await this.operators.setStatus(id, 'active', actor.actorId),
    );
  }
}
