import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PaymentIntentResult, PaymentProvider } from "./payment-provider.interface";
import { MockPaymentAdapter } from "./adapters/mock-payment.adapter";
import { StripePaymentAdapter } from "./adapters/stripe-payment.adapter";

@Injectable()
export class PaymentsService {
  private readonly provider: PaymentProvider;
  readonly usingMockProvider: boolean;

  constructor(private readonly config: ConfigService) {
    const secretKey = this.config.get<string>("stripe.secretKey");
    this.usingMockProvider = !secretKey;
    this.provider = secretKey ? new StripePaymentAdapter(secretKey) : new MockPaymentAdapter();
  }

  createPaymentIntent(amountMinor: number, orderNumber: string): Promise<PaymentIntentResult> {
    return this.provider.createPaymentIntent(amountMinor, "gbp", { orderNumber });
  }
}
