import { prisma } from "@/lib/prisma";
import { platformJson } from "../../_utils";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query")?.trim();
  const balances = await prisma.assetBalance.findMany({
    where: query
      ? {
          OR: [
            { asset: { contains: query, mode: "insensitive" } },
            { user: { email: { contains: query, mode: "insensitive" } } },
            { user: { uid: { contains: query, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: { user: { select: { id: true, uid: true, email: true, accountStatus: true, withdrawalRestricted: true } } },
    orderBy: [{ asset: "asc" }, { updatedAt: "desc" }],
    take: 200,
  });
  return platformJson({ balances });
}
