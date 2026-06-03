export type DepositIntentInput = { userId: string; asset: string; amount: number; sourceType: string };
export type ProviderResult = { platform: true; provider: string; referenceId: string; status: string; message?: string };

export interface PaymentProvider {
  createDepositIntent(input: DepositIntentInput): Promise<ProviderResult>;
  verifyWebhook(payload: unknown, signature?: string): Promise<{ platform: true; verified: boolean }>;
  getPaymentStatus(referenceId: string): Promise<ProviderResult>;
}
