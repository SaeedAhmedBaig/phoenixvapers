import { IsOptional, IsString } from "class-validator";

export class CreateBrandDto {
  @IsString() name: string;

  @IsOptional() @IsString() slug?: string;

  @IsOptional() @IsString() description?: string;
}

export class CreateCategoryDto {
  @IsString() name: string;

  @IsOptional() @IsString() slug?: string;

  @IsOptional() @IsString() description?: string;

  @IsOptional() @IsString() accent?: string;
}
