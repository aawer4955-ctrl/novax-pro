import { LedgerType } from "@prisma/client";
import { createAuditLog } from "@/lib/admin-audit";
import { requireAdminFromRequest } from "@/lib/admin-permissions";
import { creditBalance, debitBalance, freezeBalance, getBalance, unfreezeBalance } from "@/lib/ledger";
import { prisma } from "@/lib/prisma";
import { errorJson, readJson, platformJson } from "../../../_utils";

function normalizeType(value: unknown) {
  const type = String(value ?? "").toUpperCase();
  if (["CREDIT", "DEBIT", "FREEZE", "UNFREEZE"].includes(type)) return type;
  return null;
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const userId = String(body.userId ?? "");
  const asset = String(body.asset ?? "USDT").toUpperCase();
  const adjustmentType = normalizeType(body.adjustmentType);
  const amount = String(body.amount ?? "0");
  const reason = String(body.reason ?? "").trim();
  const adminId = String(body.adminId ?? "");

  if (!userId) return errorJson("userId is required.");
  if (!adjustmentType) return errorJson("adjustmentType must be CREDIT, DEBIT, FREEZE, or UNFREEZE.");
  if (!reason) return errorJson("reason is required for balance adjustments.");
  if (!adminId) return errorJson("adminId is required.");

  try {
    const admin = await requireAdminFromRequest(request, "balance.adjust", adminId);
    const result = await prisma.$transaction(async (tx) => {
      const before = await getBalance(userId, asset, tx);
      const mutation = { userId, asset, amount, referenceType: "AdminBalanceAdjustment", reason, createdByAdminId: adminId, status: "POSTED" };
      const adjusted =
        adjustmentType === "CREDIT"
          ? await creditBalance({ ...mutation, type: LedgerType.ADMIN_ADJUSTMENT }, tx)
          : adjustmentType === "DEBIT"
            ? await debitBalance({ ...mutation, type: LedgerType.ADMIN_ADJUSTMENT }, tx)
            : adjustmentType === "FREEZE"
              ? await freezeBalance(mutation, tx)
              : await unfreezeBalance(mutation, tx);

      await tx.ledgerEntry.update({ where: { id: adjusted.ledgerEntry.id }, data: { referenceId: adjusted.ledgerEntry.id } });
      const auditLog = await createAuditLog(
        {
          adminId,
          adminEmail: admin.email,
          action: `BALANCE_${adjustmentType}`,
          targetType: "AssetBalance",
          targetId: adjusted.balance.id,
          beforeData: before,
          afterData: adjusted.balance,
          reason,
          request,
        },
        tx,
      );
      return { balance: adjusted.balance, ledgerEntry: adjusted.ledgerEntry, auditLog };
    });

    return platformJson(result);
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "Balance adjustment failed.", 403);
  }
}
