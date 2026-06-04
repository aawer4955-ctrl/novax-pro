import { DepositStatus, LedgerType } from "@prisma/client";
import { createAuditLog } from "@/lib/admin-audit";
import { requireAdminFromRequest } from "@/lib/admin-permissions";
import { creditBalance } from "@/lib/ledger";
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
  const depositId = String(body.depositId ?? "");
  const adminId = String(body.adminId ?? "");
  const action = normalizeAction(body.action ?? body.decision);
  const reason = String(body.reason ?? body.adminNote ?? "").trim();

  if (!depositId) return errorJson("depositId is required.");
  if (!adminId) return errorJson("adminId is required.");
  if (action === "UNKNOWN") return errorJson("action must be APPROVE or REJECT.");
  if (!reason) return errorJson("reason is required for deposit review.");

  try {
    const admin = await requireAdminFromRequest(request, "deposit.review", adminId);
    const result = await prisma.$transaction(async (tx) => {
      const deposit = await tx.depositRequest.findUnique({ where: { id: depositId } });
      if (!deposit) throw new Error("Deposit request not found.");
      if (deposit.status !== DepositStatus.PENDING) throw new Error("Only pending deposits can be reviewed.");

      if (action === "APPROVE") {
        const updated = await tx.depositRequest.update({
          where: { id: depositId },
          data: { status: DepositStatus.APPROVED, reviewedAt: new Date(), adminNote: reason },
        });
        const credit = await creditBalance(
          {
            userId: deposit.userId,
            asset: deposit.asset,
            amount: deposit.amount,
            type: LedgerType.DEPOSIT,
            referenceType: "DepositRequest",
            referenceId: deposit.id,
            reason,
            createdByAdminId: adminId,
            status: "POSTED",
          },
          tx,
        );
        const auditLog = await createAuditLog(
          {
            adminId,
            adminEmail: admin.email,
            action: "DEPOSIT_APPROVED",
            targetType: "DepositRequest",
            targetId: deposit.id,
            beforeData: deposit,
            afterData: updated,
            reason,
            request,
          },
          tx,
        );
        return { deposit: updated, ledgerEntry: credit.ledgerEntry, auditLog };
      }

      const updated = await tx.depositRequest.update({
        where: { id: depositId },
        data: { status: DepositStatus.REJECTED, reviewedAt: new Date(), adminNote: reason },
      });
      const auditLog = await createAuditLog(
        {
          adminId,
          adminEmail: admin.email,
          action: "DEPOSIT_REJECTED",
          targetType: "DepositRequest",
          targetId: deposit.id,
          beforeData: deposit,
          afterData: updated,
          reason,
          request,
        },
        tx,
      );
      return { deposit: updated, auditLog };
    });

    return platformJson({ ...result, status: result.deposit.status });
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "Deposit review failed.", 403);
  }
}
