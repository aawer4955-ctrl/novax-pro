import { OrderStatus } from "@prisma/client";
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
  if (!orderId) return errorJson("orderId is required.");
  if (!status) return errorJson("Invalid order status.");

  const order = await prisma.order.update({ where: { id: orderId }, data: { status } });
  return platformJson({ order });
}
