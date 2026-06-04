import { prisma } from "@/lib/prisma";
import { platformJson } from "../../../_utils";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query")?.trim() ?? "";

  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query.toLowerCase(), mode: "insensitive" } },
            { uid: { contains: query, mode: "insensitive" } },
          ],
        }
      : {},
    select: {
      id: true,
      uid: true,
      email: true,
      role: true,
      kycStatus: true,
      accountStatus: true,
      withdrawalRestricted: true,
      createdAt: true,
      lastLoginAt: true,
      balances: { select: { asset: true, available: true, frozen: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return platformJson({ users });
}
