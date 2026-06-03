import { KycStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getKycProvider } from "@/lib/providers";
import { errorJson, readJson, platformJson } from "../../_utils";

export async function POST(request: Request) {
  const body = await readJson(request);
  const userId = String(body.userId ?? "");
  const level = String(body.level ?? "L1");

  if (!userId) return errorJson("userId is required.");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return errorJson("User not found.", 404);

  const applicant = await getKycProvider().createApplicant({
    userId,
    email: user.email,
    country: user.country,
    level,
  });

  const profile = await prisma.$transaction(async (tx) => {
    const created = await tx.kycProfile.create({
      data: {
        userId,
        provider: applicant.provider ?? "mock-kyc",
        providerApplicantId: applicant.applicantId,
        status: KycStatus.PENDING,
        level,
        country: user.country,
      },
    });

    await tx.user.update({ where: { id: userId }, data: { kycStatus: KycStatus.PENDING } });
    return created;
  });

  return platformJson({ applicant, profile });
}
