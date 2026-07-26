import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';

import { OperatorAuthGuard } from '../identity/operator-auth.guard';
import { CurrentOperator } from '../../common/auth/operator.decorator';
import { RequireRoles } from '../../common/auth/roles.decorator';
// `Operator` appears in decorated method signatures, so TypeScript's
// emitDecoratorMetadata requires it to be a type-only import.
import { OperatorRole } from '../../common/auth/roles';
import type { Operator } from '../../common/auth/roles';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { CatalogueService } from './catalogue.service';
import {
  adminListQuerySchema,
  complianceProfileSchema,
  createProductSchema,
  rejectReviewSchema,
  updateProductSchema,
  type AdminListQuery,
  type ComplianceProfileDto,
  type CreateProductDto,
  type RejectReviewDto,
  type UpdateProductDto,
} from './dto/product.dto';

const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/i, 'invalid id');

/**
 * Catalogue administration (spec Phase 1 prompt).
 *
 * Segregation of duties [COMPLIANCE]:
 *  - Merchandisers create/edit commerce data and move the lifecycle —
 *    but the compliance profile is not even part of their DTOs.
 *  - Compliance Officers own the profile, approval, and rejection.
 * The guard fails closed (401 when unconfigured; 403 wrong role).
 */
@Controller('admin/products')
@UseGuards(OperatorAuthGuard)
export class CatalogueAdminController {
  constructor(private readonly catalogue: CatalogueService) {}

  /* ───────────── shared reads (any catalogue operator) ───────────── */

  @Get()
  @RequireRoles(OperatorRole.MERCHANDISER, OperatorRole.COMPLIANCE_OFFICER)
  list(
    @Query(new ZodValidationPipe(adminListQuerySchema)) query: AdminListQuery,
  ) {
    return this.catalogue.adminList(query);
  }

  @Get(':id')
  @RequireRoles(OperatorRole.MERCHANDISER, OperatorRole.COMPLIANCE_OFFICER)
  get(@Param('id', new ZodValidationPipe(objectIdSchema)) id: string) {
    return this.catalogue.adminGet(id);
  }

  /* ─────────────────── merchandiser lifecycle ─────────────────────── */

  @Post()
  @RequireRoles(OperatorRole.MERCHANDISER)
  create(
    @Body(new ZodValidationPipe(createProductSchema)) dto: CreateProductDto,
    @CurrentOperator() operator: Operator,
  ) {
    return this.catalogue.createDraft(dto, operator);
  }

  @Patch(':id')
  @RequireRoles(OperatorRole.MERCHANDISER)
  update(
    @Param('id', new ZodValidationPipe(objectIdSchema)) id: string,
    @Body(new ZodValidationPipe(updateProductSchema)) dto: UpdateProductDto,
    @CurrentOperator() operator: Operator,
  ) {
    return this.catalogue.updateDraft(id, dto, operator);
  }

  @Post(':id/submit-for-review')
  @RequireRoles(OperatorRole.MERCHANDISER)
  submitForReview(
    @Param('id', new ZodValidationPipe(objectIdSchema)) id: string,
    @CurrentOperator() operator: Operator,
  ) {
    return this.catalogue.submitForReview(id, operator);
  }

  @Post(':id/publish')
  @RequireRoles(OperatorRole.MERCHANDISER)
  publish(
    @Param('id', new ZodValidationPipe(objectIdSchema)) id: string,
    @CurrentOperator() operator: Operator,
  ) {
    return this.catalogue.publish(id, operator);
  }

  @Post(':id/retire')
  @RequireRoles(OperatorRole.MERCHANDISER, OperatorRole.COMPLIANCE_OFFICER)
  retire(
    @Param('id', new ZodValidationPipe(objectIdSchema)) id: string,
    @CurrentOperator() operator: Operator,
  ) {
    return this.catalogue.retire(id, operator);
  }

  /** Drafts only — anything past draft retires instead (audit trail). */
  @Delete(':id')
  @RequireRoles(OperatorRole.MERCHANDISER)
  deleteDraft(
    @Param('id', new ZodValidationPipe(objectIdSchema)) id: string,
    @CurrentOperator() operator: Operator,
  ) {
    return this.catalogue.deleteDraft(id, operator);
  }

  /* ──────────── compliance officer operations [COMPLIANCE] ────────── */

  @Put(':id/compliance-profile')
  @RequireRoles(OperatorRole.COMPLIANCE_OFFICER)
  setComplianceProfile(
    @Param('id', new ZodValidationPipe(objectIdSchema)) id: string,
    @Body(new ZodValidationPipe(complianceProfileSchema))
    dto: ComplianceProfileDto,
    @CurrentOperator() operator: Operator,
  ) {
    return this.catalogue.updateComplianceProfile(id, dto, operator);
  }

  @Post(':id/approve')
  @RequireRoles(OperatorRole.COMPLIANCE_OFFICER)
  approve(
    @Param('id', new ZodValidationPipe(objectIdSchema)) id: string,
    @CurrentOperator() operator: Operator,
  ) {
    return this.catalogue.approveCompliance(id, operator);
  }

  @Post(':id/reject')
  @RequireRoles(OperatorRole.COMPLIANCE_OFFICER)
  reject(
    @Param('id', new ZodValidationPipe(objectIdSchema)) id: string,
    @Body(new ZodValidationPipe(rejectReviewSchema)) dto: RejectReviewDto,
    @CurrentOperator() operator: Operator,
  ) {
    return this.catalogue.rejectReview(id, dto.reason, operator);
  }
}
