import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { createHmac } from "crypto";
import { WebhookEndpoint } from "./schemas/webhook-endpoint.schema";

/**
 * Generic outbound integration point (e.g. a future age-verification
 * provider callback, or a WooCommerce migration hook) — registrable per
 * event without code changes.
 */
@Injectable()
export class IntegrationsService {
  constructor(@InjectModel(WebhookEndpoint.name) private readonly model: Model<WebhookEndpoint>) {}

  findAll(): Promise<WebhookEndpoint[]> {
    return this.model.find().lean() as any;
  }

  create(dto: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> {
    return this.model.create(dto);
  }

  async update(id: string, dto: Partial<WebhookEndpoint>): Promise<WebhookEndpoint | null> {
    return this.model.findByIdAndUpdate(id, dto, { new: true }).lean() as any;
  }

  async dispatch(event: string, payload: Record<string, unknown>): Promise<void> {
    const endpoints = await this.model.find({ event, active: true }).lean() as any;
    const body = JSON.stringify(payload);

    await Promise.all(
      endpoints.map(async (endpoint) => {
        const signature = createHmac("sha256", endpoint.secret).update(body).digest("hex");
        try {
          await fetch(endpoint.url, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Phoenix-Signature": signature },
            body,
          });
        } catch {
          // Best-effort delivery; a durable retry queue is a future enhancement.
        }
      }),
    );
  }
}
