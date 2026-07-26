import { Injectable } from '@nestjs/common';

import { CatalogueService } from '../../catalogue/catalogue.service';
import type { ProductCard } from '../../catalogue/serializers/product.serializer';
import type { SearchPort } from '../search.port';

/**
 * MongoDB text-search adapter — Phase 1 interim engine.
 *
 * Goes through the Catalogue module's public interface rather than the
 * collection (bounded contexts, spec §16.7). MongoDB $text gives stemming
 * and relevance scoring; typo tolerance and synonyms arrive with the
 * OpenSearch adapter.
 */
@Injectable()
export class MongoSearchAdapter implements SearchPort {
  constructor(private readonly catalogue: CatalogueService) {}

  search(term: string, limit: number): Promise<ProductCard[]> {
    return this.catalogue.searchSellable(term, limit);
  }
}
