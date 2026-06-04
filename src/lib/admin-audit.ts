import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type DbClient = typeof prisma | Prisma.TransactionClient;

type AuditInput = {
  adminId: string;
  adminEmail?: string;
  action: string;
  targetType: string;
  targetId: string;
  beforeData?: unknown;
  afterData?: unknown;
  reason?: string;
  request?: Request;
};

function toJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  return JSON.parse(
    JSON.stringify(value, (_key, item) => {
      if (item && typeof item === "object" && "toString" in item && item.constructor?.name === "Decimal") return item.toString();
      if (item instanceof Date) return item.toISOString();
      return item;
    }),
  ) as Prisma.InputJsonValue;
}

export async function createAuditLog(input: AuditInput, client?: DbClient) {
  const db = (client ?? prisma) as DbClient;
  const adminEmail =
    input.adminEmail ??
    (await db.user.findUnique({ where: { id: input.adminId }, select: { email: true } }))?.email ??
    "unknown-admin";

  return db.auditLog.create({
    data: {
      adminId: input.adminId,
      adminEmail,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      beforeData: toJson(input.beforeData),
      afterData: toJson(input.afterData),
      reason: input.reason,
      ipAddress: input.request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: input.request?.headers.get("user-agent"),
    },
  });
}
