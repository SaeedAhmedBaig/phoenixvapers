import { Controller, Get, Inject, Query } from '@nestjs/common';
import { z } from 'zod';

import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { SEARCH_PORT, type SearchPort } from './search.port';

/**
 * Search query: length-bounded and character-restricted at the boundary.
 * The allowed set covers real product vocabulary ("18mg menthol", "70/30")
 * while excluding operator characters outright.
 */
const searchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(
      /^[\p{L}\p{N}\s\-./&%']+$/u,
      'query contains unsupported characters',
    ),
  limit: z.coerce.number().int().min(1).max(48).default(24),
});

type SearchQuery = z.infer<typeof searchQuerySchema>;

/** Public search endpoint (spec §19.1: GET /search?q=). */
@Controller('search')
export class SearchController {
  constructor(@Inject(SEARCH_PORT) private readonly engine: SearchPort) {}

  @Get()
  async search(
    @Query(new ZodValidationPipe(searchQuerySchema)) query: SearchQuery,
  ) {
    const items = await this.engine.search(query.q, query.limit);
    return { items, total: items.length };
  }
}
