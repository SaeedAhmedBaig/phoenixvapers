import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class AddCartItemDto {
  @IsString() productSlug: string;

  @IsOptional() @IsString() strength?: string;

  @IsOptional() @IsInt() @Min(1) qty?: number = 1;
}

export class UpdateCartItemDto {
  @IsInt() @Min(0) qty: number;
}
