import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LoyaltyAccount, LoyaltyAccountSchema } from "./schemas/loyalty-account.schema";
import { LoyaltyLedgerEntry, LoyaltyLedgerEntrySchema } from "./schemas/loyalty-ledger.schema";
import { LoyaltyService } from "./loyalty.service";
import { LoyaltyController } from "./loyalty.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LoyaltyAccount.name, schema: LoyaltyAccountSchema },
      { name: LoyaltyLedgerEntry.name, schema: LoyaltyLedgerEntrySchema },
    ]),
  ],
  controllers: [LoyaltyController],
  providers: [LoyaltyService],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
