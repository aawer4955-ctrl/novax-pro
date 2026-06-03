import { prisma } from "@/lib/prisma";
import { platformJson } from "../../_utils";

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId");
  const ledgerEntries = await prisma.ledgerEntry.findMany({
    where: userId ? { userId } : undefined,
    include: { user: { select: { email: true, uid: true } } },
    orderBy: { createdAt: "desc" },
  });

  return platformJson({ ledgerEntries });
}
