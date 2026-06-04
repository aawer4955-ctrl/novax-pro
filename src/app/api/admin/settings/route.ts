import { createAuditLog } from "@/lib/admin-audit";
import { requireAdminFromRequest } from "@/lib/admin-permissions";
import { prisma } from "@/lib/prisma";
import { errorJson, platformJson, readJson } from "../../_utils";

const editableKeys = ["platformName", "accessCodeHelpText", "frontAnnouncement", "maintenanceMode"] as const;

export async function GET() {
  const settings = await prisma.siteSetting.findMany({ where: { key: { in: [...editableKeys] } } });
  return platformJson({
    settings: Object.fromEntries(settings.map((item) => [item.key, item.value])),
    appMode: process.env.APP_MODE ?? "platform",
    providerStatus: {
      payment: process.env.PAYMENT_PROVIDER ?? "mock-payment",
      custody: process.env.CUSTODY_PROVIDER ?? "mock-custody",
      kyc: process.env.KYC_PROVIDER ?? "mock-kyc",
      aml: process.env.AML_PROVIDER ?? "mock-aml",
    },
  });
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const adminId = String(body.adminId ?? "");
  const reason = String(body.reason ?? "").trim();
  if (!adminId) return errorJson("adminId is required.");
  if (!reason) return errorJson("reason is required for settings changes.");

  try {
    const admin = await requireAdminFromRequest(request, "settings.update", adminId);
    const result = await prisma.$transaction(async (tx) => {
      const before = await tx.siteSetting.findMany({ where: { key: { in: [...editableKeys] } } });
      const updates = await Promise.all(
        editableKeys
          .filter((key) => body[key] !== undefined)
          .map((key) =>
            tx.siteSetting.upsert({
              where: { key },
              update: { value: String(body[key]) },
              create: { key, value: String(body[key]) },
            }),
          ),
      );
      const auditLog = await createAuditLog({ adminId, adminEmail: admin.email, action: "SETTINGS_UPDATED", targetType: "SiteSetting", targetId: "platform", beforeData: before, afterData: updates, reason, request }, tx);
      return { settings: updates, auditLog };
    });
    return platformJson(result);
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "Settings update failed.", 403);
  }
}
