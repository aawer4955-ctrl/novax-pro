import { WithdrawalStatus } from "@prisma/client";
import { createAuditLog } from "@/lib/admin-audit";
import { requireAdminFromRequest } from "@/lib/admin-permissions";
import { settleFrozenWithdrawal, unfreezeBalance } from "@/lib/ledger";
import { prisma } from "@/lib/prisma";
import { errorJson, readJson, platformJson } from "../../../_utils";

function normalizeAction(value: unknown) {
  const action = String(value ?? "").toUpperCase();
  if (action === "APPROVE" || action === "APPROVED") return "APPROVE";
  if (action === "REJECT" || action === "REJECTED") return "REJECT";
  if (action === "PROCESSING") return "PROCESSING";
  if (action === "COMPLETED" || action === "COMPLETE") return "COMPLETED";
  return "UNKNOWN";
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const withdrawalId = String(body.withdrawalId ?? "");
  const adminId = String(body.adminId ?? "");
  const action = normalizeAction(body.action ?? body.decision);
  const reason = String(body.reason ?? body.adminNote ?? "").trim();

  if (!withdrawalId) return errorJson("withdrawalId is required.");
  if (!adminId) return errorJson("adminId is required.");
  if (action === "UNKNOWN") return errorJson("action must be APPROVE, REJECT, PROCESSING, or COMPLETED.");
  if (!reason) return errorJson("reason is required for withdrawal review.");

  try {
    const admin = await requireAdminFromRequest(request, "withdrawal.review", adminId);
    const result = await prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawalRequest.findUnique({ where: { id: withdrawalId } });
      if (!withdrawal) throw new Error("Withdrawal request not found.");

      const total = withdrawal.amount.plus(withdrawal.fee);

      if (action === "APPROVE") {
        if (withdrawal.status !== WithdrawalStatus.PENDING) throw new Error("Only pending withdrawals can be approved.");
        const updated = await tx.withdrawalRequest.update({
          where: { id: withdrawalId },
          data: { status: WithdrawalStatus.APPROVED, reviewedAt: new Date(), adminNote: reason },
        });
        const settled = await settleFrozenWithdrawal(
          {
            userId: withdrawal.userId,
            asset: withdrawal.asset,
            amount: total,
            referenceType: "WithdrawalRequest",
            referenceId: withdrawal.id,
            reason,
            createdByAdminId: adminId,
            status: "POSTED",
          },
          tx,
        );
        const auditLog = await createAuditLog(
          { adminId, adminEmail: admin.email, action: "WITHDRAWAL_APPROVED", targetType: "WithdrawalRequest", targetId: withdrawal.id, beforeData: withdrawal, afterData: updated, reason, request },
          tx,
        );
        return { withdrawal: updated, ledgerEntry: settled.ledgerEntry, auditLog };
      }

      if (action === "REJECT") {
        if (withdrawal.status !== WithdrawalStatus.PENDING) throw new Error("Only pending withdrawals can be rejected.");
        const updated = await tx.withdrawalRequest.update({
          where: { id: withdrawalId },
          data: { status: WithdrawalStatus.REJECTED, reviewedAt: new Date(), adminNote: reason },
        });
        const unfreeze = await unfreezeBalance(
          {
            userId: withdrawal.userId,
            asset: withdrawal.asset,
            amount: total,
            referenceType: "WithdrawalRequest",
            referenceId: withdrawal.id,
            reason,
            createdByAdminId: adminId,
            status: "POSTED",
          },
          tx,
        );
        const auditLog = await createAuditLog(
          { adminId, adminEmail: admin.email, action: "WITHDRAWAL_REJECTED", targetType: "WithdrawalRequest", targetId: withdrawal.id, beforeData: withdrawal, afterData: updated, reason, request },
          tx,
        );
        return { withdrawal: updated, ledgerEntry: unfreeze.ledgerEntry, auditLog };
      }

      const status = action === "PROCESSING" ? WithdrawalStatus.PROCESSING : WithdrawalStatus.COMPLETED;
      const updated = await tx.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: { status, adminNote: reason, reviewedAt: withdrawal.reviewedAt ?? new Date() },
      });
      const auditLog = await createAuditLog(
        { adminId, adminEmail: admin.email, action: `WITHDRAWAL_${status}`, targetType: "WithdrawalRequest", targetId: withdrawal.id, beforeData: withdrawal, afterData: updated, reason, request },
        tx,
      );
      return { withdrawal: updated, auditLog };
    });

    return platformJson({ ...result, status: result.withdrawal.status });
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "Withdrawal review failed.", 403);
  }
}
