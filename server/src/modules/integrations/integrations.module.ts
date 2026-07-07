import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WebhookEndpoint, WebhookEndpointSchema } from "./schemas/webhook-endpoint.schema";
import { IntegrationsService } from "./integrations.service";
import { IntegrationsController } from "./integrations.controller";

@Module({
  imports: [MongooseModule.forFeature([{ name: WebhookEndpoint.name, schema: WebhookEndpointSchema }])],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
