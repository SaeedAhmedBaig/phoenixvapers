import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ShippingMethod } from "./schemas/shipping-method.schema";

const DEFAULT_METHODS = [
  {
    code: "tracked-24",
    label: "Royal Mail Tracked 24",
    priceMinor: 399,
    freeThresholdMinor: 3000,
    etaLabel: "Next working day (most UK postcodes)",
  },
  {
    code: "tracked-48",
    label: "Royal Mail Tracked 48",
    priceMinor: 299,
    etaLabel: "2-3 working days",
  },
];

@Injectable()
export class ShippingService implements OnModuleInit {
  constructor(@InjectModel(ShippingMethod.name) private readonly model: Model<ShippingMethod>) {}

  async onModuleInit(): Promise<void> {
    for (const method of DEFAULT_METHODS) {
      const exists = await this.model.exists({ code: method.code });
      if (!exists) await this.model.create(method);
    }
  }

  findActive(): Promise<ShippingMethod[]> {
    return this.model.find({ active: true }).lean() as any;
  }

  async calculate(subtotalMinor: number, code = "tracked-24"): Promise<{ method: ShippingMethod; priceMinor: number }> {
    const method = (await this.model.findOne({ code, active: true }).lean() as any) ?? (await this.model.findOne({ active: true }).lean() as any);
    if (!method) return { method: null as unknown as ShippingMethod, priceMinor: 0 };

    const free = method.freeThresholdMinor != null && subtotalMinor >= method.freeThresholdMinor;
    return { method, priceMinor: free ? 0 : method.priceMinor };
  }
}
