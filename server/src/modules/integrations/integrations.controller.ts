import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { PERMISSIONS } from "../../common/constants/permissions";
import { IntegrationsService } from "./integrations.service";
import type { WebhookEndpoint } from "./schemas/webhook-endpoint.schema";

@Controller("integrations/webhooks")
@UseGuards(PermissionsGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @Permissions(PERMISSIONS.INTEGRATIONS_MANAGE)
  findAll() {
    return this.integrationsService.findAll();
  }

  @Post()
  @Permissions(PERMISSIONS.INTEGRATIONS_MANAGE)
  create(@Body() dto: Partial<WebhookEndpoint>) {
    return this.integrationsService.create(dto);
  }

  @Patch(":id")
  @Permissions(PERMISSIONS.INTEGRATIONS_MANAGE)
  update(@Param("id") id: string, @Body() dto: Partial<WebhookEndpoint>) {
    return this.integrationsService.update(id, dto);
  }
}
