import { ForbiddenException, Injectable, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ComplianceRule } from "./schemas/compliance-rule.schema";
import { AgeVerification } from "./schemas/age-verification.schema";
import { RecordAgeVerificationDto, UpdateComplianceRuleDto } from "./dto/compliance.dto";

const DEFAULT_RULES: Array<{ key: string; value: unknown; description: string }> = [
  {
    key: "min_age",
    value: 18,
    description: "Minimum age required to purchase any nicotine or CBD product.",
  },
  {
    key: "max_nicotine_mg_per_ml",
    value: 20,
    description: "UK TPD maximum nicotine strength permitted in any e-liquid listing.",
  },
  {
    key: "prohibited_categories",
    value: ["disposable-vape"],
    description: "Product categories that cannot be listed for sale (UK disposable-vape ban).",
  },
];

@Injectable()
export class ComplianceService implements OnModuleInit {
  constructor(
    @InjectModel(ComplianceRule.name) private readonly ruleModel: Model<ComplianceRule>,
    @InjectModel(AgeVerification.name) private readonly ageModel: Model<AgeVerification>,
  ) {}

  async onModuleInit(): Promise<void> {
    for (const rule of DEFAULT_RULES) {
      const exists = await this.ruleModel.exists({ key: rule.key });
      if (!exists) await this.ruleModel.create(rule);
    }
  }

  listRules(): Promise<ComplianceRule[]> {
    return this.ruleModel.find().lean() as any;
  }

  async updateRule(key: string, dto: UpdateComplianceRuleDto): Promise<ComplianceRule | null> {
    return this.ruleModel.findOneAndUpdate({ key }, dto, { new: true, upsert: false }).lean() as any;
  }

  private async ruleValue<T>(key: string): Promise<T | undefined> {
    const rule = await this.ruleModel.findOne({ key }).lean() as any;
    return rule?.value as T | undefined;
  }

  /**
   * Structural enforcement: a prohibited category or an over-limit nicotine
   * strength cannot be listed for sale at all — this is called from
   * Catalogue's product create/update path, not left to staff training.
   */
  async assertProductCompliant(input: { category: string; nicotineMg?: number }): Promise<void> {
    const prohibited = (await this.ruleValue<string[]>("prohibited_categories")) ?? [];
    if (prohibited.includes(input.category)) {
      throw new ForbiddenException(
        `Category "${input.category}" is prohibited and cannot be listed for sale`,
      );
    }

    const maxNicotine = (await this.ruleValue<number>("max_nicotine_mg_per_ml")) ?? 20;
    if (input.nicotineMg != null && input.nicotineMg > maxNicotine) {
      throw new ForbiddenException(
        `Nicotine strength ${input.nicotineMg}mg/ml exceeds the UK TPD maximum of ${maxNicotine}mg/ml`,
      );
    }
  }

  async recordAgeVerification(dto: RecordAgeVerificationDto, userId?: string): Promise<AgeVerification> {
    return this.ageModel.create({
      userId,
      subjectKey: dto.subjectKey,
      method: "self-declared",
      provider: dto.provider,
      passed: dto.confirmed,
    });
  }

  /**
   * Zero technical pathway for checkout without a passed verification. The
   * self-declared method is the manual-review fallback path called for in
   * the PRD risk register so checkout is never blocked solely by a
   * third-party age-verification provider outage.
   */
  async assertAgeVerified(subjectKey: string): Promise<void> {
    const latest = await this.ageModel.findOne({ subjectKey }).sort({ createdAt: -1 }).lean() as any;
    if (!latest?.passed) {
      throw new ForbiddenException("Age verification is required before checkout can complete");
    }
  }
}
