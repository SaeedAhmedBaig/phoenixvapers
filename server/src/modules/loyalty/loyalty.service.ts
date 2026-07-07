import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { LoyaltyAccount } from "./schemas/loyalty-account.schema";
import { LoyaltyLedgerEntry } from "./schemas/loyalty-ledger.schema";

const POINTS_PER_POUND = 1;
const REGISTRATION_BONUS = 100;
const POINTS_PER_PENNY_DISCOUNT = 1;

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectModel(LoyaltyAccount.name) private readonly accountModel: Model<LoyaltyAccount>,
    @InjectModel(LoyaltyLedgerEntry.name) private readonly ledgerModel: Model<LoyaltyLedgerEntry>,
  ) {}

  private async getOrCreateAccount(userId: string): Promise<LoyaltyAccount> {
    const existing = await this.accountModel.findOne({ user: userId });
    if (existing) return existing;
    return this.accountModel.create({ user: userId, pointsBalance: 0 });
  }

  async balance(userId: string): Promise<number> {
    const account = await this.accountModel.findOne({ user: userId }).lean() as any;
    return account?.pointsBalance ?? 0;
  }

  async ledger(userId: string, limit = 50): Promise<LoyaltyLedgerEntry[]> {
    return this.ledgerModel.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).lean() as any;
  }

  private async applyDelta(userId: string, delta: number, reason: string, orderId?: string): Promise<LoyaltyAccount> {
    const account = await this.getOrCreateAccount(userId);
    account.pointsBalance += delta;
    await account.save();
    await this.ledgerModel.create({ user: userId, order: orderId, delta, reason, balanceAfter: account.pointsBalance });
    return account;
  }

  async grantRegistrationBonus(userId: string): Promise<void> {
    await this.applyDelta(userId, REGISTRATION_BONUS, "Registration bonus");
  }

  /** 1 loyalty point earned per £1 of order subtotal (after discounts, before delivery). */
  async earnForOrder(userId: string, orderId: string, discountedSubtotalMinor: number): Promise<void> {
    const points = Math.floor((discountedSubtotalMinor / 100) * POINTS_PER_POUND);
    if (points > 0) await this.applyDelta(userId, points, "Order reward", orderId);
  }

  /** 100 points = £1 discount, applied before the free-shipping threshold is recalculated. */
  async redeem(userId: string, points: number): Promise<{ discountMinor: number; balance: number }> {
    const account = await this.getOrCreateAccount(userId);
    if (points <= 0 || points > account.pointsBalance) {
      throw new BadRequestException("Insufficient loyalty points balance");
    }
    account.pointsBalance -= points;
    await account.save();
    await this.ledgerModel.create({
      user: userId,
      delta: -points,
      reason: "Redeemed for discount",
      balanceAfter: account.pointsBalance,
    });
    return { discountMinor: points * POINTS_PER_PENNY_DISCOUNT, balance: account.pointsBalance };
  }
}
