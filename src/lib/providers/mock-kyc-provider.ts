import { KycApplicantInput, KycProvider } from "./kyc-provider";

export class MockKycProvider implements KycProvider {
  async createApplicant(input: KycApplicantInput) {
    return { platform: true as const, provider: "mock-kyc", applicantId: `kyc_${input.userId}_${crypto.randomUUID()}`, status: "PENDING" };
  }
  async getApplicantStatus(applicantId: string) {
    return { platform: true as const, provider: "mock-kyc", applicantId, status: "PENDING" };
  }
  async verifyWebhook(_payload: unknown, _signature?: string) {
    return { platform: true as const, verified: true };
  }
}
