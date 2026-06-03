import { Prisma } from "@prisma/client";
import { defaultMarketPairs } from "@/lib/default-market-data";
import { prisma } from "@/lib/prisma";
import { platformJson } from "../../_utils";

function toMarket(row: { symbol: string; baseAsset: string; quoteAsset: string; latestPrice: unknown; change24h: unknown; high24h?: unknown; low24h?: unknown; volume24h: unknown; isActive?: boolean }) {
  return {
    symbol: row.symbol,
    baseAsset: row.baseAsset,
    quoteAsset: row.quoteAsset,
    latestPrice: row.latestPrice?.toString?.() ?? String(row.latestPrice),
    change24h: row.change24h?.toString?.() ?? String(row.change24h),
    high24h: row.high24h?.toString?.() ?? String(row.high24h ?? "0"),
    low24h: row.low24h?.toString?.() ?? String(row.low24h ?? "0"),
    volume24h: row.volume24h?.toString?.() ?? String(row.volume24h),
    isActive: row.isActive ?? true,
  };
}

export async function GET() {
  try {
    const rows = await prisma.marketPair.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { symbol: "asc" }],
    });

    if (rows.length > 0) return platformJson({ markets: rows.map(toMarket) });
  } catch {
    // Database may not be migrated yet. Fall back to safe fallback data.
  }

  return platformJson({
    markets: defaultMarketPairs.map((item) =>
      toMarket({
        ...item,
        latestPrice: new Prisma.Decimal(item.latestPrice),
        change24h: new Prisma.Decimal(item.change24h),
        high24h: new Prisma.Decimal(item.high24h),
        low24h: new Prisma.Decimal(item.low24h),
        volume24h: new Prisma.Decimal(item.volume24h),
      }),
    ),
  });
}
