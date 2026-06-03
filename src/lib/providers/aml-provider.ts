export type AmlResult = { platform: true; provider: string; status: "PASSED" | "PENDING" | "FAILED"; riskScore: number };

export interface AmlProvider {
  screenTransaction(input: { asset: string; amount: number; txHash?: string }): Promise<AmlResult>;
  screenWalletAddress(input: { asset: string; network: string; address: string }): Promise<AmlResult>;
}
