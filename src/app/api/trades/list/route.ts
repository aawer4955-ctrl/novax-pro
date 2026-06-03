import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { platformJson } from "../../_utils";

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId");
  const orders = await prisma.order.findMany({
    where: { status: OrderStatus.FILLED, ...(userId ? { userId } : {}) },
    include: { user: { select: { email: true, uid: true } } },
    orderBy: { createdAt: "desc" },
  });
  return platformJson({ trades: orders });
}
