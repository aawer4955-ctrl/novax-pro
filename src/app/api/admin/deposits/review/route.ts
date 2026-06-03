import { DepositStatus, LedgerType } from "@prisma/client";
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

  if (!depositId) return errorJson("depositId is required.");
  if (!adminId) return errorJson("adminId is required.");
  if (action === "UNKNOWN") return errorJson("action must be APPROVE or REJECT.");

  const result = await prisma.$transaction(async (tx) => {
    const deposit = await tx.depositRequest.findUnique({ where: { id: depositId } });
    if (!deposit) throw new Error("Deposit request not found.");
    if (deposit.status !== DepositStatus.PENDING) throw new Error("Only pending deposits can be reviewed.");

    if (action === "APPROVE") {
      const updated = await tx.depositRequest.update({
        where: { id: depositId },
        data: { status: DepositStatus.APPROVED, reviewedAt: new Date() },
      });
      const credit = await creditBalance(
        {
          userId: deposit.userId,
          asset: deposit.asset,
          amount: deposit.amount,
          type: LedgerType.DEPOSIT,
          referenceType: "DepositRequest",
          referenceId: deposit.id,
          status: "POSTED",
        },
        tx,
      );
      const auditLog = await tx.auditLog.create({
        data: { adminId, action: "DEPOSIT_APPROVED", targetType: "DepositRequest", targetId: deposit.id },
      });
      return { deposit: updated, ledgerEntry: credit.ledgerEntry, auditLog };
    }

    const updated = await tx.depositRequest.update({
      where: { id: depositId },
      data: { status: DepositStatus.REJECTED, reviewedAt: new Date() },
    });
    const auditLog = await tx.auditLog.create({
      data: { adminId, action: "DEPOSIT_REJECTED", targetType: "DepositRequest", targetId: deposit.id },
    });
    return { deposit: updated, auditLog };
  });

  return platformJson({ ...result, status: result.deposit.status });
}
