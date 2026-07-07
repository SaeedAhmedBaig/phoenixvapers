import { randomUUID } from "crypto";
import { PaymentIntentResult, PaymentProvider } from "../payment-provider.interface";

/**
 * Auto-approving adapter used whenever no Stripe secret key is configured,
 * so checkout is never blocked by absent payment-provider credentials in
 * development — the same fallback-path principle the PRD applies to the
 * age-verification provider.
 */
export class MockPaymentAdapter implements PaymentProvider {
  async createPaymentIntent(amountMinor: number): Promise<PaymentIntentResult> {
    return { id: `mock_${randomUUID()}`, clientSecret: null, status: "succeeded" };
  }
}
