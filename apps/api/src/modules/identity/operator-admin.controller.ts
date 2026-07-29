import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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

/** Edit-staff payload — every field optional (partial update). */
const updateOperatorSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  email: z.string().email().max(200).optional(),
  role: z.nativeEnum(OperatorRole).optional(),
});
type UpdateOperatorBody = z.infer<typeof updateOperatorSchema>;

/** Reset-password payload — same policy as account creation. */
const resetPasswordSchema = z.object({
  password: z.string().min(10).max(200),
});
type ResetPasswordBody = z.infer<typeof resetPasswordSchema>;

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

  @Get(':id')
  @RequireRoles(OperatorRole.PLATFORM_ADMIN)
  async get(@Param('id', new ZodValidationPipe(objectIdSchema)) id: string) {
    return toPublicOperator(await this.operators.requireById(id));
  }

  @Patch(':id')
  @RequireRoles(OperatorRole.PLATFORM_ADMIN)
  async update(
    @Param('id', new ZodValidationPipe(objectIdSchema)) id: string,
    @Body(new ZodValidationPipe(updateOperatorSchema)) dto: UpdateOperatorBody,
    @CurrentOperator() actor: Operator,
  ) {
    return toPublicOperator(
      await this.operators.update(id, dto, actor.actorId),
    );
  }

  @Post(':id/reset-password')
  @RequireRoles(OperatorRole.PLATFORM_ADMIN)
  async resetPassword(
    @Param('id', new ZodValidationPipe(objectIdSchema)) id: string,
    @Body(new ZodValidationPipe(resetPasswordSchema)) dto: ResetPasswordBody,
    @CurrentOperator() actor: Operator,
  ) {
    await this.operators.resetPassword(id, dto.password, actor.actorId);
    return { ok: true };
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
