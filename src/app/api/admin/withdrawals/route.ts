import { prisma } from "@/lib/prisma";
import { platformJson } from "../../_utils";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;
  const withdrawals = await prisma.withdrawalRequest.findMany({
    where: status ? { status: status as never } : undefined,
    include: { user: { select: { email: true, uid: true, riskLevel: true, withdrawalRestricted: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return platformJson({ withdrawals });
}
