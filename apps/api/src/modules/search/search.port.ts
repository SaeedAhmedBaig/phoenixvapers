import type { ProductCard } from '../catalogue/serializers/product.serializer';

/**
 * Search port (hexagonal boundary).
 *
 * The spec targets OpenSearch (§5.4/§16.3); this project runs without
 * Docker, so Edition Phase 1 ships a MongoDB text-search adapter and the
 * OpenSearch adapter drops in behind this same port when infrastructure
 * allows (ADR: search-adapter-mongo-first). Nothing outside the Search
 * module may depend on WHICH engine answers a query.
 */
export const SEARCH_PORT = Symbol('SEARCH_PORT');

export interface SearchPort {
  /** Free-text product search over sellable products. */
  search(term: string, limit: number): Promise<ProductCard[]>;
}
