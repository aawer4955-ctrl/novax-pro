import { OrderStatus } from "@prisma/client";
import { createAuditLog } from "@/lib/admin-audit";
import { requireAdminFromRequest } from "@/lib/admin-permissions";
import { prisma } from "@/lib/prisma";
import { errorJson, readJson, platformJson } from "../../_utils";

function normalizeStatus(value: unknown): OrderStatus | null {
  const status = String(value ?? "").toUpperCase();
  if (["OPEN", "FILLED", "CANCELED", "REJECTED"].includes(status)) return status as OrderStatus;
  return null;
}

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { user: { select: { email: true, uid: true } } },
    orderBy: { createdAt: "desc" },
  });
  return platformJson({ orders });
}

export async function PUT(request: Request) {
  const body = await readJson(request);
  const orderId = String(body.orderId ?? "");
  const status = normalizeStatus(body.status);
  const adminId = String(body.adminId ?? "");
  const reason = String(body.reason ?? "").trim();
  if (!orderId) return errorJson("orderId is required.");
  if (!status) return errorJson("Invalid order status.");
  if (!adminId) return errorJson("adminId is required.");
  if (!reason) return errorJson("reason is required for order status changes.");

  try {
    const admin = await requireAdminFromRequest(request, status === OrderStatus.CANCELED ? "order.cancel" : "order.read", adminId);
    const result = await prisma.$transaction(async (tx) => {
      const before = await tx.order.findUnique({ where: { id: orderId } });
      if (!before) throw new Error("Order not found.");
      const order = await tx.order.update({ where: { id: orderId }, data: { status } });
      const auditLog = await createAuditLog({ adminId, adminEmail: admin.email, action: `ORDER_${status}`, targetType: "Order", targetId: orderId, beforeData: before, afterData: order, reason, request }, tx);
      return { order, auditLog };
    });
    return platformJson(result);
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "Order update failed.", 403);
  }
}
