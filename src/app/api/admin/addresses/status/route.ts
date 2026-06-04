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

export async function GET() {
  const depositAddresses = await prisma.userDepositAddress.findMany({
    include: {
      user: { select: { id: true, uid: true, email: true, kycStatus: true, accountStatus: true } },
      assignedByAdmin: { select: { id: true, uid: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const withdrawalAddresses = await prisma.withdrawalAddress.findMany({
    include: {
      user: { select: { id: true, uid: true, email: true, kycStatus: true, accountStatus: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return platformJson({ depositAddresses, withdrawalAddresses });
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const id = String(body.id ?? body.addressId ?? "").trim();
  const type = String(body.type ?? "Deposit").toLowerCase();
  const enabled = Boolean(body.enabled ?? body.isActive);

  if (!id) return errorJson("addressId is required.");

  const reason = String(body.reason ?? "Address status update").trim();
  const admin = await resolveAdmin(String(body.adminId ?? ""));
  const adminId = admin.id;

  if (type === "withdrawal") {
    const before = await prisma.withdrawalAddress.findUnique({ where: { id } });
    const withdrawalAddress = await prisma.withdrawalAddress.update({
      where: { id },
      data: { isWhitelisted: enabled },
      include: { user: { select: { id: true, uid: true, email: true, kycStatus: true, accountStatus: true } } },
    });
    const auditLog = await createAuditLog(
      {
        adminId,
        adminEmail: admin.email,
        action: enabled ? "WITHDRAWAL_ADDRESS_ENABLED" : "WITHDRAWAL_ADDRESS_DISABLED",
        targetType: "WithdrawalAddress",
        targetId: withdrawalAddress.id,
        beforeData: before,
        afterData: withdrawalAddress,
        reason,
        request,
      },
    );
    return platformJson({ address: withdrawalAddress, auditLog });
  }

  const existing = await prisma.userDepositAddress.findUnique({ where: { id } });
  if (!existing) return errorJson("Address not found.", 404);

  const result = await prisma.$transaction(async (tx) => {
    if (enabled) {
      await tx.userDepositAddress.updateMany({
        where: {
          userId: existing.userId,
          asset: existing.asset,
          network: existing.network,
          status: DepositAddressStatus.ACTIVE,
          id: { not: id },
        },
        data: { status: DepositAddressStatus.DISABLED },
      });
    }

    const depositAddress = await tx.userDepositAddress.update({
      where: { id },
      data: { status: enabled ? DepositAddressStatus.ACTIVE : DepositAddressStatus.DISABLED },
      include: {
        user: { select: { id: true, uid: true, email: true, kycStatus: true, accountStatus: true } },
        assignedByAdmin: { select: { id: true, uid: true, email: true } },
      },
    });

    const auditLog = await createAuditLog(
      {
        adminId,
        adminEmail: admin.email,
        action: enabled ? "DEPOSIT_ADDRESS_ENABLED" : "DEPOSIT_ADDRESS_DISABLED",
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

  return platformJson({ address: result.depositAddress, auditLog: result.auditLog });
}
