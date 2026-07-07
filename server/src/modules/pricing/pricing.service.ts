import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Promotion } from "./schemas/promotion.schema";
import { CreatePromotionDto } from "./dto/promotion.dto";

export interface PricingLineInput {
  productId: string;
  brandSlug: string;
  categorySlug: string;
  unitPriceMinor: number;
  qty: number;
}

export interface AppliedPromotion {
  code: string;
  label: string;
  discountMinor: number;
}

export interface PromotionResult {
  discountMinor: number;
  applied: AppliedPromotion[];
}

@Injectable()
export class PricingService {
  constructor(@InjectModel(Promotion.name) private readonly model: Model<Promotion>) {}

  findAllActive(): Promise<Promotion[]> {
    return this.model.find({ active: true }).lean() as any;
  }

  create(dto: CreatePromotionDto): Promise<Promotion> {
    return this.model.create(dto);
  }

  async update(code: string, dto: Partial<CreatePromotionDto>): Promise<Promotion | null> {
    return this.model.findOneAndUpdate({ code }, dto, { new: true }).lean() as any;
  }

  async applyPromotions(lines: PricingLineInput[]): Promise<PromotionResult> {
    const promotions = await this.findAllActive();
    const applied: AppliedPromotion[] = [];
    let discountMinor = 0;

    for (const promo of promotions) {
      const matches = lines.filter(
        (line) =>
          (promo.matchBrandSlugs.length === 0 || promo.matchBrandSlugs.includes(line.brandSlug)) &&
          (promo.matchCategorySlugs.length === 0 || promo.matchCategorySlugs.includes(line.categorySlug)),
      );
      if (matches.length === 0) continue;

      if (promo.type === "bundle") {
        const { buyQty, forPriceMinor } = promo.config;
        const totalQty = matches.reduce((sum, line) => sum + line.qty, 0);
        const bundles = Math.floor(totalQty / buyQty);
        if (bundles > 0) {
          const totalValue = matches.reduce((sum, line) => sum + line.unitPriceMinor * line.qty, 0);
          const avgUnitPrice = totalValue / totalQty;
          const bundleDiscount = Math.round(bundles * (avgUnitPrice * buyQty - forPriceMinor));
          if (bundleDiscount > 0) {
            discountMinor += bundleDiscount;
            applied.push({ code: promo.code, label: promo.label, discountMinor: bundleDiscount });
          }
        }
      }

      if (promo.type === "percentage") {
        const { percentageOff } = promo.config;
        const matchedSubtotal = matches.reduce((sum, line) => sum + line.unitPriceMinor * line.qty, 0);
        const lineDiscount = Math.round(matchedSubtotal * (percentageOff / 100));
        if (lineDiscount > 0) {
          discountMinor += lineDiscount;
          applied.push({ code: promo.code, label: promo.label, discountMinor: lineDiscount });
        }
      }
    }

    return { discountMinor, applied };
  }
}
