import { WithdrawalStatus } from "@prisma/client";
import { settleFrozenWithdrawal, unfreezeBalance } from "@/lib/ledger";
import { prisma } from "@/lib/prisma";
import { errorJson, readJson, platformJson } from "../../../_utils";

function normalizeAction(value: unknown) {
  const action = String(value ?? "").toUpperCase();
  if (action === "APPROVE" || action === "APPROVED") return "APPROVE";
  if (action === "REJECT" || action === "REJECTED") return "REJECT";
  return "UNKNOWN";
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const withdrawalId = String(body.withdrawalId ?? "");
  const adminId = String(body.adminId ?? "");
  const action = normalizeAction(body.action ?? body.decision);

  if (!withdrawalId) return errorJson("withdrawalId is required.");
  if (!adminId) return errorJson("adminId is required.");
  if (action === "UNKNOWN") return errorJson("action must be APPROVE or REJECT.");

  const result = await prisma.$transaction(async (tx) => {
    const withdrawal = await tx.withdrawalRequest.findUnique({ where: { id: withdrawalId } });
    if (!withdrawal) throw new Error("Withdrawal request not found.");
    if (withdrawal.status !== WithdrawalStatus.PENDING) throw new Error("Only pending withdrawals can be reviewed.");

    const total = withdrawal.amount.plus(withdrawal.fee);

    if (action === "APPROVE") {
      const updated = await tx.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: { status: WithdrawalStatus.APPROVED, reviewedAt: new Date() },
      });
      const settled = await settleFrozenWithdrawal(
        {
          userId: withdrawal.userId,
          asset: withdrawal.asset,
          amount: total,
          referenceType: "WithdrawalRequest",
          referenceId: withdrawal.id,
          status: "POSTED",
        },
        tx,
      );
      const auditLog = await tx.auditLog.create({
        data: { adminId, action: "WITHDRAWAL_APPROVED", targetType: "WithdrawalRequest", targetId: withdrawal.id },
      });
      return { withdrawal: updated, ledgerEntry: settled.ledgerEntry, auditLog };
    }

    const updated = await tx.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: { status: WithdrawalStatus.REJECTED, reviewedAt: new Date() },
    });
    const unfreeze = await unfreezeBalance(
      {
        userId: withdrawal.userId,
        asset: withdrawal.asset,
        amount: total,
        referenceType: "WithdrawalRequest",
        referenceId: withdrawal.id,
        status: "POSTED",
      },
      tx,
    );
    const auditLog = await tx.auditLog.create({
      data: { adminId, action: "WITHDRAWAL_REJECTED", targetType: "WithdrawalRequest", targetId: withdrawal.id },
    });
    return { withdrawal: updated, ledgerEntry: unfreeze.ledgerEntry, auditLog };
  });

  return platformJson({ ...result, status: result.withdrawal.status });
}
