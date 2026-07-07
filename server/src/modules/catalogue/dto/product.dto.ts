import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { PaginationQueryDto } from "../../../common/dto/pagination.dto";

export class CreateProductDto {
  @IsOptional() @IsString() slug?: string;

  @IsString() name: string;

  @IsString() brandSlug: string;

  @IsString() categorySlug: string;

  @IsString() collection: string;

  @IsString() format: string;

  @IsOptional() @IsString() flavour?: string;

  @IsOptional() @IsString() draw?: string;

  @IsString() strength: string;

  @IsInt() @Min(0) priceMinor: number;

  @IsOptional() @IsInt() @Min(0) compareAtMinor?: number;

  @IsOptional() @IsString() badge?: string;

  @IsOptional() @IsNumber() nicotineMg?: number;

  @IsString() description: string;

  @IsOptional() @IsArray() @IsString({ each: true }) notes?: string[];
}

export class UpdateProductDto extends CreateProductDto {}

export class ProductQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString() category?: string;

  @IsOptional() @IsString() collection?: string;

  @IsOptional() @IsString() brand?: string;

  @IsOptional() @IsString() format?: string;

  @IsOptional() @IsString() flavour?: string;

  @IsOptional() @IsString() q?: string;

  @IsOptional()
  @Type(() => Boolean)
  onlyDeals?: boolean;

  @IsOptional()
  @IsIn(["featured", "price-asc", "price-desc", "rating"])
  sort?: string;
}
