import { prisma } from "@/lib/prisma";
import { getKycProvider } from "@/lib/providers";
import { platformJson } from "../../_utils";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const applicantId = url.searchParams.get("applicantId");
  const userId = url.searchParams.get("userId");

  const profiles = await prisma.kycProfile.findMany({
    where: {
      ...(userId ? { userId } : {}),
      ...(applicantId ? { providerApplicantId: applicantId } : {}),
    },
    orderBy: { submittedAt: "desc" },
  });

  const providerStatus = applicantId ? await getKycProvider().getApplicantStatus(applicantId) : null;
  return platformJson({ profiles, providerStatus });
}
