import { AccountStatus } from "@prisma/client";
import { createAuditLog } from "@/lib/admin-audit";
import { requireAdminFromRequest } from "@/lib/admin-permissions";
import { prisma } from "@/lib/prisma";
import { errorJson, readJson, platformJson } from "../../../_utils";

function normalizeStatus(value: unknown): AccountStatus | null {
  const status = String(value ?? "").toUpperCase();
  if (status === "ACTIVE") return AccountStatus.ACTIVE;
  if (status === "FROZEN") return AccountStatus.FROZEN;
  if (status === "SUSPENDED") return AccountStatus.SUSPENDED;
  return null;
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const userId = String(body.userId ?? "");
  const adminId = String(body.adminId ?? "");
  const accountStatus = normalizeStatus(body.accountStatus ?? body.status);
  const reason = String(body.reason ?? "").trim();

  if (!userId) return errorJson("userId is required.");
  if (!adminId) return errorJson("adminId is required.");
  if (!accountStatus) return errorJson("accountStatus must be ACTIVE, FROZEN, or SUSPENDED.");
  if (!reason) return errorJson("reason is required for user status changes.");

  try {
    const admin = await requireAdminFromRequest(request, accountStatus === AccountStatus.FROZEN ? "user.freeze" : "user.update", adminId);
    const result = await prisma.$transaction(async (tx) => {
      const before = await tx.user.findUnique({ where: { id: userId } });
      if (!before) throw new Error("User not found.");
      const user = await tx.user.update({ where: { id: userId }, data: { accountStatus } });
      const auditLog = await createAuditLog(
        {
          adminId,
          adminEmail: admin.email,
          action: `USER_STATUS_${accountStatus}`,
          targetType: "User",
          targetId: userId,
          beforeData: { accountStatus: before.accountStatus },
          afterData: { accountStatus: user.accountStatus },
          reason,
          request,
        },
        tx,
      );
      return { user, auditLog };
    });

    const { passwordHash: _passwordHash, ...safeUser } = result.user;
    return platformJson({ user: safeUser, auditLog: result.auditLog, status: accountStatus });
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "User status update failed.", 403);
  }
}
