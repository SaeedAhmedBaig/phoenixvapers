import { IsInt, IsString, Max, Min } from "class-validator";

export class CreateReviewDto {
  @IsString() productSlug: string;

  @IsInt() @Min(1) @Max(5) rating: number;

  @IsString() title: string;

  @IsString() body: string;
}
