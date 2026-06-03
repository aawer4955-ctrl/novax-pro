import { CustodyProvider, WithdrawalInput } from "./custody-provider";

export class MockCustodyProvider implements CustodyProvider {
  async createDepositAddress(userId: string, asset: string, network: string) {
    return { platform: true as const, provider: "mock-custody", referenceId: `addr_${crypto.randomUUID()}`, status: "CREATED", address: `${network}_${asset}_${userId}_platform` };
  }
  async requestWithdrawal(input: WithdrawalInput) {
    return { platform: true as const, provider: "mock-custody", referenceId: `wd_${crypto.randomUUID()}`, status: "PENDING", address: input.destinationAddress };
  }
  async getTransactionStatus(referenceId: string) {
    return { platform: true as const, provider: "mock-custody", referenceId, status: "PENDING" };
  }
}
