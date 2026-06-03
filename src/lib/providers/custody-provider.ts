export type WithdrawalInput = { userId: string; asset: string; network: string; amount: number; destinationAddress: string };
export type CustodyResult = { platform: true; provider: string; referenceId: string; status: string; address?: string };

export interface CustodyProvider {
  createDepositAddress(userId: string, asset: string, network: string): Promise<CustodyResult>;
  requestWithdrawal(input: WithdrawalInput): Promise<CustodyResult>;
  getTransactionStatus(referenceId: string): Promise<CustodyResult>;
}
