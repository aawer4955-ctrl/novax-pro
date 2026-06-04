import { AccountStatus, Prisma, UserRole } from "@prisma/client";
import { createAuditLog } from "@/lib/admin-audit";
import { requireAdminFromRequest } from "@/lib/admin-permissions";
import { prisma } from "@/lib/prisma";
import { errorJson, readJson, platformJson } from "../../../_utils";

function normalizeRole(value: unknown): UserRole | null {
  const role = String(value ?? "").toUpperCase();
  if (Object.values(UserRole).includes(role as UserRole)) return role as UserRole;
  return null;
}

function normalizeStatus(value: unknown): AccountStatus | undefined {
  if (value === undefined) return undefined;
  const status = String(value ?? "").toUpperCase();
  if (Object.values(AccountStatus).includes(status as AccountStatus)) return status as AccountStatus;
  return undefined;
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const userId = String(body.userId ?? "");
  const adminId = String(body.adminId ?? "");
  const reason = String(body.reason ?? "").trim();
  const role = body.role === undefined ? undefined : normalizeRole(body.role);
  const accountStatus = normalizeStatus(body.accountStatus);
  const withdrawalRestricted = body.withdrawalRestricted === undefined ? undefined : Boolean(body.withdrawalRestricted);
  const passwordResetRequired = body.passwordResetRequired === undefined ? undefined : Boolean(body.passwordResetRequired);

  if (!userId) return errorJson("userId is required.");
  if (!adminId) return errorJson("adminId is required.");
  if (!reason) return errorJson("reason is required for user changes.");
  if (body.role !== undefined && !role) return errorJson("Invalid role.");

  try {
    const permission = role ? "admin.manage" : withdrawalRestricted !== undefined ? "withdrawal.restrict" : accountStatus === AccountStatus.FROZEN ? "user.freeze" : "user.update";
    const admin = await requireAdminFromRequest(request, permission, adminId);
    const result = await prisma.$transaction(async (tx) => {
      const before = await tx.user.findUnique({ where: { id: userId } });
      if (!before) throw new Error("User not found.");
      const data: Prisma.UserUpdateInput = {};
      if (role) data.role = role;
      if (accountStatus) data.accountStatus = accountStatus;
      if (withdrawalRestricted !== undefined) data.withdrawalRestricted = withdrawalRestricted;
      if (passwordResetRequired !== undefined) data.passwordResetRequired = passwordResetRequired;
      const user = await tx.user.update({
        where: { id: userId },
        data,
      });
      const auditLog = await createAuditLog({
        adminId,
        adminEmail: admin.email,
        action: "USER_UPDATED",
        targetType: "User",
        targetId: userId,
        beforeData: before,
        afterData: user,
        reason,
        request,
      }, tx);
      return { user, auditLog };
    });
    const { passwordHash: _passwordHash, ...safeUser } = result.user;
    return platformJson({ user: safeUser, auditLog: result.auditLog });
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "User update failed.", 403);
  }
}
