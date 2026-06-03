import { prisma } from "@/lib/prisma";
import { platformJson } from "../../_utils";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const email = url.searchParams.get("email")?.toLowerCase();
  const user = !userId && email ? await prisma.user.findUnique({ where: { email } }) : null;
  const resolvedUserId = userId ?? user?.id;

  const orders = await prisma.order.findMany({
    where: resolvedUserId ? { userId: resolvedUserId } : undefined,
    include: { user: { select: { email: true, uid: true } } },
    orderBy: { createdAt: "desc" },
  });

  return platformJson({ orders });
}
