import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Setting } from "./schemas/setting.schema";

const DEFAULT_SETTINGS = [{ key: "maintenance_mode", value: false, description: "Blocks storefront checkout when true." }];

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(@InjectModel(Setting.name) private readonly model: Model<Setting>) {}

  async onModuleInit(): Promise<void> {
    for (const setting of DEFAULT_SETTINGS) {
      const exists = await this.model.exists({ key: setting.key });
      if (!exists) await this.model.create(setting);
    }
  }

  findAll(): Promise<Setting[]> {
    return this.model.find().lean() as any;
  }

  async set(key: string, value: unknown, description?: string): Promise<Setting> {
    return this.model.findOneAndUpdate(
      { key },
      { value, ...(description ? { description } : {}) },
      { new: true, upsert: true },
    );
  }
}
