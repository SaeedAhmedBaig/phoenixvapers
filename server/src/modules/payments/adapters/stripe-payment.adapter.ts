import Stripe from "stripe";
import { PaymentIntentResult, PaymentProvider } from "../payment-provider.interface";

export class StripePaymentAdapter implements PaymentProvider {
  private readonly stripe: Stripe;

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey);
  }

  async createPaymentIntent(
    amountMinor: number,
    currency: string,
    metadata: Record<string, string>,
  ): Promise<PaymentIntentResult> {
    const intent = await this.stripe.paymentIntents.create({
      amount: amountMinor,
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });

    return {
      id: intent.id,
      clientSecret: intent.client_secret,
      status: intent.status === "succeeded" ? "succeeded" : "requires_action",
    };
  }
}
