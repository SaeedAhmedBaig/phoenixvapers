import { Module } from "@nestjs/common";
import { CatalogueModule } from "../catalogue/catalogue.module";
import { SearchService } from "./search.service";
import { SearchController } from "./search.controller";

@Module({
  imports: [CatalogueModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
