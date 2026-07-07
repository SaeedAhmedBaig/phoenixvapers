export interface PaymentIntentResult {
  id: string;
  clientSecret: string | null;
  status: "requires_action" | "succeeded" | "failed";
}

export interface PaymentProvider {
  createPaymentIntent(amountMinor: number, currency: string, metadata: Record<string, string>): Promise<PaymentIntentResult>;
}
