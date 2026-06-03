import { prisma } from "@/lib/prisma";
import { platformJson } from "../../_utils";

const demoBalances = [
  { asset: "USDT", available: "10000", frozen: "0" },
  { asset: "BTC", available: "0.1", frozen: "0" },
  { asset: "ETH", available: "2", frozen: "0" },
  { asset: "SOL", available: "20", frozen: "0" },
  { asset: "BNB", available: "3", frozen: "0" },
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const email = url.searchParams.get("email");

  try {
    const user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : email
        ? await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
        : null;

    if (!user) return platformJson({ balances: demoBalances });

    const balances = await prisma.assetBalance.findMany({ where: { userId: user.id }, orderBy: { asset: "asc" } });
    return platformJson({
      userId: user.id,
      balances: balances.map((item) => ({ asset: item.asset, available: item.available.toString(), frozen: item.frozen.toString() })),
    });
  } catch {
    return platformJson({ balances: demoBalances });
  }
}
