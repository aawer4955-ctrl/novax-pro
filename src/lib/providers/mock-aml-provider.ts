import { AmlProvider } from "./aml-provider";

export class MockAmlProvider implements AmlProvider {
  async screenTransaction(_input: { asset: string; amount: number; txHash?: string }) {
    return { platform: true as const, provider: "mock-aml", status: "PASSED" as const, riskScore: 12 };
  }
  async screenWalletAddress(_input: { asset: string; network: string; address: string }) {
    return { platform: true as const, provider: "mock-aml", status: "PASSED" as const, riskScore: 18 };
  }
}
