import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { errorJson, readJson, platformJson } from "../../_utils";

function decimal(value: unknown, fallback = "0") {
  return new Prisma.Decimal(String(value ?? fallback));
}

export async function GET() {
  const markets = await prisma.marketPair.findMany({ orderBy: [{ sortOrder: "asc" }, { symbol: "asc" }] });
  return platformJson({ markets });
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const symbol = String(body.symbol ?? "").trim().toUpperCase();
  if (!symbol || !symbol.includes("/")) return errorJson("symbol must use BASE/QUOTE format.");
  const [baseAsset, quoteAsset] = symbol.split("/");
  const market = await prisma.marketPair.create({
    data: {
      symbol,
      baseAsset,
      quoteAsset,
      latestPrice: decimal(body.latestPrice),
      change24h: decimal(body.change24h),
      high24h: decimal(body.high24h ?? body.latestPrice),
      low24h: decimal(body.low24h ?? body.latestPrice),
      volume24h: decimal(body.volume24h),
      sortOrder: Number(body.sortOrder ?? 0),
      isActive: body.isActive ?? true,
    },
  });
  return platformJson({ market });
}

export async function PUT(request: Request) {
  const body = await readJson(request);
  const id = String(body.id ?? "");
  if (!id) return errorJson("id is required.");
  const market = await prisma.marketPair.update({
    where: { id },
    data: {
      latestPrice: body.latestPrice === undefined ? undefined : decimal(body.latestPrice),
      change24h: body.change24h === undefined ? undefined : decimal(body.change24h),
      high24h: body.high24h === undefined ? undefined : decimal(body.high24h),
      low24h: body.low24h === undefined ? undefined : decimal(body.low24h),
      volume24h: body.volume24h === undefined ? undefined : decimal(body.volume24h),
      sortOrder: body.sortOrder === undefined ? undefined : Number(body.sortOrder),
      isActive: body.isActive === undefined ? undefined : Boolean(body.isActive),
    },
  });
  return platformJson({ market });
}
