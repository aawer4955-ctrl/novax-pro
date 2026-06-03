import { AccountStatus } from "@prisma/client";
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

  if (!userId) return errorJson("userId is required.");
  if (!adminId) return errorJson("adminId is required.");
  if (!accountStatus) return errorJson("accountStatus must be ACTIVE, FROZEN, or SUSPENDED.");

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({ where: { id: userId }, data: { accountStatus } });
    const auditLog = await tx.auditLog.create({
      data: { adminId, action: `USER_STATUS_${accountStatus}`, targetType: "User", targetId: userId },
    });
    return { user, auditLog };
  });

  const { passwordHash: _passwordHash, ...safeUser } = result.user;
  return platformJson({ user: safeUser, auditLog: result.auditLog, status: accountStatus });
}
