import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { PERMISSIONS } from "../../common/constants/permissions";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import type { AuthUser } from "../../common/types/auth-user.type";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/review.dto";

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get()
  list(@Query("product") productSlug: string, @Query() query: PaginationQueryDto) {
    return this.reviewsService.list(productSlug, query.page, query.limit);
  }

  @Post()
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: AuthUser) {
    return this.reviewsService.create(dto, user.userId, user.email);
  }

  @Delete(":id")
  @UseGuards(PermissionsGuard)
  @Permissions(PERMISSIONS.REVIEWS_MODERATE)
  remove(@Param("id") id: string) {
    return this.reviewsService.remove(id);
  }
}
