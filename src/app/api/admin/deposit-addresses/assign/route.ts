import { DepositAddressSourceType, DepositAddressStatus, UserRole } from "@prisma/client";
import { validateAddressFormat, normalizeAsset, normalizeNetwork } from "@/lib/address-validator";
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
  const userId = String(body.userId ?? "").trim();
  const asset = normalizeAsset(String(body.asset ?? ""));
  const network = normalizeNetwork(String(body.network ?? ""));
  const address = String(body.address ?? "").trim();
  const memo = String(body.memo ?? "").trim();
  const label = String(body.label ?? "").trim();
  const reason = String(body.reason ?? "Assign deposit address").trim();

  if (!userId) return errorJson("userId is required.");
  if (!asset || !network || !address) return errorJson("asset, network, and address are required.");
  if (!validateAddressFormat(asset, network, address)) return errorJson("Invalid address format");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return errorJson("User not found.", 404);

  const admin = await resolveAdmin(String(body.adminId ?? ""));
  const adminId = admin.id;
  const assignedAt = new Date();

  const result = await prisma.$transaction(async (tx) => {
    await tx.userDepositAddress.updateMany({
      where: { userId, asset, network, status: DepositAddressStatus.ACTIVE },
      data: { status: DepositAddressStatus.DISABLED },
    });

    const depositAddress = await tx.userDepositAddress.create({
      data: {
        userId,
        asset,
        network,
        address,
        memo: memo || null,
        label: label || null,
        sourceType: DepositAddressSourceType.ADMIN_ASSIGNED,
        status: DepositAddressStatus.ACTIVE,
        assignedByAdminId: adminId,
        assignedAt,
      },
      include: {
        user: { select: { id: true, uid: true, email: true, kycStatus: true, accountStatus: true } },
        assignedByAdmin: { select: { id: true, uid: true, email: true } },
      },
    });

    const auditLog = await createAuditLog(
      {
        adminId,
        adminEmail: admin.email,
        action: "DEPOSIT_ADDRESS_ASSIGNED",
        targetType: "UserDepositAddress",
        targetId: depositAddress.id,
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
