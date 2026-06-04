import { DepositSourceType, DepositStatus, Prisma } from "@prisma/client";
import { createAuditLog } from "@/lib/admin-audit";
import { requireAdminFromRequest } from "@/lib/admin-permissions";
import { prisma } from "@/lib/prisma";
import { errorJson, readJson, platformJson } from "../../_utils";

export async function GET() {
  const deposits = await prisma.depositRequest.findMany({
    include: { user: { select: { email: true, uid: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return platformJson({ deposits });
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const userId = String(body.userId ?? "");
  const adminId = String(body.adminId ?? "");
  const reason = String(body.reason ?? body.adminNote ?? "").trim();
  const asset = String(body.asset ?? "USDT").toUpperCase();
  const network = String(body.network ?? "TRC20").toUpperCase();
  const amount = new Prisma.Decimal(String(body.amount ?? "0"));

  if (!userId) return errorJson("userId is required.");
  if (!adminId) return errorJson("adminId is required.");
  if (!reason) return errorJson("reason is required for manual deposits.");
  if (amount.lte(0)) return errorJson("amount must be positive.");

  try {
    const admin = await requireAdminFromRequest(request, "deposit.review", adminId);
    const result = await prisma.$transaction(async (tx) => {
      const deposit = await tx.depositRequest.create({
        data: {
          userId,
          asset,
          network,
          amount,
          sourceType: DepositSourceType.CRYPTO,
          provider: "manual-admin",
          txHash: String(body.txHash ?? ""),
          address: String(body.address ?? ""),
          status: DepositStatus.PENDING,
          adminNote: reason,
        },
      });
      const auditLog = await createAuditLog({
        adminId,
        adminEmail: admin.email,
        action: "DEPOSIT_CREATED",
        targetType: "DepositRequest",
        targetId: deposit.id,
        afterData: deposit,
        reason,
        request,
      }, tx);
      return { deposit, auditLog };
    });
    return platformJson(result);
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "Deposit create failed.", 403);
  }
}
