export type KycApplicantInput = { userId: string; email: string; country: string; level: string };
export type KycResult = { platform: true; provider: string; applicantId: string; status: string };

export interface KycProvider {
  createApplicant(input: KycApplicantInput): Promise<KycResult>;
  getApplicantStatus(applicantId: string): Promise<KycResult>;
  verifyWebhook(payload: unknown, signature?: string): Promise<{ platform: true; verified: boolean }>;
}
