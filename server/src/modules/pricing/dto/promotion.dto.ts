import { IsArray, IsBoolean, IsIn, IsObject, IsOptional, IsString } from "class-validator";

export class CreatePromotionDto {
  @IsString() code: string;

  @IsString() label: string;

  @IsIn(["bundle", "percentage"]) type: string;

  @IsOptional() @IsArray() @IsString({ each: true }) matchBrandSlugs?: string[];

  @IsOptional() @IsArray() @IsString({ each: true }) matchCategorySlugs?: string[];

  @IsObject() config: Record<string, number>;

  @IsOptional() @IsBoolean() active?: boolean;
}
