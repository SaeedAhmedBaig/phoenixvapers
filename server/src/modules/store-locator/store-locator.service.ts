import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Store } from "./schemas/store.schema";

@Injectable()
export class StoreLocatorService {
  constructor(@InjectModel(Store.name) private readonly model: Model<Store>) {}

  findAll(): Promise<Store[]> {
    return this.model.find().lean() as any;
  }

  /** Postcode-prefix match today; the 2dsphere index is ready for real $near geocoding later. */
  findByPostcode(postcode: string): Promise<Store[]> {
    const prefix = postcode.trim().split(" ")[0];
    return this.model.find({ postcode: new RegExp(`^${prefix}`, "i") }).lean() as any;
  }

  create(dto: Partial<Store>): Promise<Store> {
    return this.model.create(dto);
  }
}
