import { DepositAddressStatus, UserRole } from "@prisma/client";
import { createAuditLog } from "@/lib/admin-audit";
import { createDefaultAdminIfMissing } from "@/lib/db-auth";
import { prisma } from "@/lib/prisma";
import { errorJson, platformJson, readJson } from "../../../_utils";

async function resolveAdmin(adminId?: string) {
  const requestedAdminId = String(adminId ?? "").trim();
  if (requestedAdminId) {
    const admin = await prisma.user.findUnique({ where: { id: requestedAdminId } });
    if (admin && admin.role !== UserRole.USER) return admin;
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: { not: UserRole.USER } },
    orderBy: { createdAt: "asc" },
  });
  if (existingAdmin) return existingAdmin;

  const defaultAdmin = await createDefaultAdminIfMissing();
  return defaultAdmin;
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const addressId = String(body.addressId ?? "").trim();
  const reason = String(body.reason ?? "Disable deposit address").trim();

  if (!addressId) return errorJson("addressId is required.");

  const existing = await prisma.userDepositAddress.findUnique({ where: { id: addressId } });
  if (!existing) return errorJson("Address not found.", 404);

  const admin = await resolveAdmin(String(body.adminId ?? ""));
  const adminId = admin.id;
  const result = await prisma.$transaction(async (tx) => {
    const depositAddress = await tx.userDepositAddress.update({
      where: { id: addressId },
      data: { status: DepositAddressStatus.DISABLED },
      include: {
        user: { select: { id: true, uid: true, email: true, kycStatus: true, accountStatus: true } },
        assignedByAdmin: { select: { id: true, uid: true, email: true } },
      },
    });

    const auditLog = await createAuditLog(
      {
        adminId,
        adminEmail: admin.email,
        action: "DEPOSIT_ADDRESS_DISABLED",
        targetType: "UserDepositAddress",
        targetId: depositAddress.id,
        beforeData: existing,
        afterData: depositAddress,
        reason,
        request,
      },
      tx,
    );

    return { depositAddress, auditLog };
  });

  return platformJson({ success: true, ...result });
}
