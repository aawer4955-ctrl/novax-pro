import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { errorJson, readJson, platformJson } from "../../_utils";

export async function POST(request: Request) {
  const body = await readJson(request);
  const orderId = String(body.orderId ?? "");
  const userId = body.userId ? String(body.userId) : undefined;
  if (!orderId) return errorJson("orderId is required.");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return errorJson("Order not found.", 404);
  if (userId && order.userId !== userId) return errorJson("Order does not belong to this user.", 403);
  if (order.status === OrderStatus.FILLED) return errorJson("Filled orders cannot be canceled.");

  const updated = await prisma.order.update({ where: { id: orderId }, data: { status: OrderStatus.CANCELED } });
  return platformJson({ order: updated });
}
