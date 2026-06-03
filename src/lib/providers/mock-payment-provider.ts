import { DepositIntentInput, PaymentProvider } from "./payment-provider";

export class MockPaymentProvider implements PaymentProvider {
  async createDepositIntent(input: DepositIntentInput) {
    return { platform: true as const, provider: "mock-payment", referenceId: `pay_${crypto.randomUUID()}`, status: "PENDING", message: `Platform deposit intent for ${input.amount} ${input.asset}` };
  }
  async verifyWebhook(_payload: unknown, _signature?: string) {
    return { platform: true as const, verified: true };
  }
  async getPaymentStatus(referenceId: string) {
    return { platform: true as const, provider: "mock-payment", referenceId, status: "PENDING" };
  }
}
