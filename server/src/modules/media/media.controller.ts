import { Body, Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { PERMISSIONS } from "../../common/constants/permissions";
import type { AuthUser } from "../../common/types/auth-user.type";
import { MediaService } from "./media.service";

@Controller("media")
@UseGuards(PermissionsGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @Permissions(PERMISSIONS.MEDIA_MANAGE)
  findAll() {
    return this.mediaService.findAll();
  }

  @Post("upload")
  @Permissions(PERMISSIONS.MEDIA_MANAGE)
  @UseInterceptors(FileInterceptor("file"))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body("altText") altText: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.mediaService.upload(file, altText, user.userId);
  }
}
