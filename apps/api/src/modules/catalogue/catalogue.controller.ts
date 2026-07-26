import { Controller, Get, Param, Query } from '@nestjs/common';

import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { CatalogueService } from './catalogue.service';
import {
  listProductsQuerySchema,
  type ListProductsQuery,
} from './dto/product.dto';
import { z } from 'zod';

const slugParamSchema = z
  .string()
  .regex(/^[a-z0-9][a-z0-9-]{1,79}$/, 'invalid slug');

/**
 * Public catalogue endpoints (spec §19.1) — sellable products only.
 * Read-only, unauthenticated, rate-limited globally.
 */
@Controller('products')
export class CatalogueController {
  constructor(private readonly catalogue: CatalogueService) {}

  /** PLP: filtered, paginated listing with facet counts. */
  @Get()
  list(
    @Query(new ZodValidationPipe(listProductsQuerySchema))
    query: ListProductsQuery,
  ) {
    return this.catalogue.listSellable(query);
  }

  /** PDP: one product + related products. */
  @Get(':slug')
  detail(@Param('slug', new ZodValidationPipe(slugParamSchema)) slug: string) {
    return this.catalogue.getSellableBySlug(slug);
  }
}
