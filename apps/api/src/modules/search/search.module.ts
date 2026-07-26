import { Module } from '@nestjs/common';

import { CatalogueModule } from '../catalogue/catalogue.module';
import { MongoSearchAdapter } from './adapters/mongo-search.adapter';
import { SearchController } from './search.controller';
import { SEARCH_PORT } from './search.port';

/**
 * Search bounded context (spec §16.2). The engine binding is the ONLY
 * place that decides Mongo vs OpenSearch — swap the useClass to migrate.
 */
@Module({
  imports: [CatalogueModule],
  controllers: [SearchController],
  providers: [{ provide: SEARCH_PORT, useClass: MongoSearchAdapter }],
})
export class SearchModule {}
