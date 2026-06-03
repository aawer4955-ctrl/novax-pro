import { DepositAddressStatus, UserRole } from "@prisma/client";
import { createDefaultAdminIfMissing } from "@/lib/db-auth";
import { prisma } from "@/lib/prisma";
import { errorJson, platformJson, readJson } from "../../../_utils";

async function resolveAdminId(adminId?: string) {
  const requestedAdminId = String(adminId ?? "").trim();
  if (requestedAdminId) {
    const admin = await prisma.user.findUnique({ where: { id: requestedAdminId } });
    if (admin?.role === UserRole.ADMIN) return admin.id;
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
    orderBy: { createdAt: "asc" },
  });
  if (existingAdmin) return existingAdmin.id;

  const defaultAdmin = await createDefaultAdminIfMissing();
  return defaultAdmin.id;
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const addressId = String(body.addressId ?? "").trim();

  if (!addressId) return errorJson("addressId is required.");

  const existing = await prisma.userDepositAddress.findUnique({ where: { id: addressId } });
  if (!existing) return errorJson("Address not found.", 404);

  const adminId = await resolveAdminId(String(body.adminId ?? ""));
  const result = await prisma.$transaction(async (tx) => {
    const depositAddress = await tx.userDepositAddress.update({
      where: { id: addressId },
      data: { status: DepositAddressStatus.DISABLED },
      include: {
        user: { select: { id: true, uid: true, email: true, kycStatus: true, accountStatus: true } },
        assignedByAdmin: { select: { id: true, uid: true, email: true } },
      },
    });

    const auditLog = await tx.auditLog.create({
      data: {
        adminId,
        action: "DEPOSIT_ADDRESS_DISABLED",
        targetType: "UserDepositAddress",
        targetId: depositAddress.id,
      },
    });

    return { depositAddress, auditLog };
  });

  return platformJson({ success: true, ...result });
}
