import { Prisma } from "@prisma/client";
import { createAuditLog } from "@/lib/admin-audit";
import { requireAdminFromRequest } from "@/lib/admin-permissions";
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
  const adminId = String(body.adminId ?? "");
  const reason = String(body.reason ?? "").trim();
  const symbol = String(body.symbol ?? "").trim().toUpperCase();
  if (!symbol || !symbol.includes("/")) return errorJson("symbol must use BASE/QUOTE format.");
  if (!adminId) return errorJson("adminId is required.");
  if (!reason) return errorJson("reason is required for market changes.");
  const [baseAsset, quoteAsset] = symbol.split("/");
  try {
    const admin = await requireAdminFromRequest(request, "market.update", adminId);
    const result = await prisma.$transaction(async (tx) => {
      const market = await tx.marketPair.create({
        data: {
          symbol,
          baseAsset,
          quoteAsset,
          latestPrice: decimal(body.latestPrice),
          basePrice: body.basePrice === undefined ? undefined : decimal(body.basePrice),
          fallbackPrice: body.fallbackPrice === undefined ? undefined : decimal(body.fallbackPrice),
          change24h: decimal(body.change24h),
          high24h: decimal(body.high24h ?? body.latestPrice),
          low24h: decimal(body.low24h ?? body.latestPrice),
          volume24h: decimal(body.volume24h),
          sortOrder: Number(body.sortOrder ?? 0),
          minOrderAmount: decimal(body.minOrderAmount),
          pricePrecision: Number(body.pricePrecision ?? 2),
          amountPrecision: Number(body.amountPrecision ?? 6),
          useHtxData: body.useHtxData ?? true,
          isActive: body.isActive ?? true,
        },
      });
      const auditLog = await createAuditLog({ adminId, adminEmail: admin.email, action: "MARKET_CREATED", targetType: "MarketPair", targetId: market.id, afterData: market, reason, request }, tx);
      return { market, auditLog };
    });
    return platformJson(result);
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "Market create failed.", 403);
  }
}

export async function PUT(request: Request) {
  const body = await readJson(request);
  const id = String(body.id ?? "");
  const adminId = String(body.adminId ?? "");
  const reason = String(body.reason ?? "").trim();
  if (!id) return errorJson("id is required.");
  if (!adminId) return errorJson("adminId is required.");
  if (!reason) return errorJson("reason is required for market changes.");
  try {
    const admin = await requireAdminFromRequest(request, "market.update", adminId);
    const result = await prisma.$transaction(async (tx) => {
      const before = await tx.marketPair.findUnique({ where: { id } });
      if (!before) throw new Error("Market not found.");
      const market = await tx.marketPair.update({
        where: { id },
        data: {
          latestPrice: body.latestPrice === undefined ? undefined : decimal(body.latestPrice),
          basePrice: body.basePrice === undefined ? undefined : decimal(body.basePrice),
          fallbackPrice: body.fallbackPrice === undefined ? undefined : decimal(body.fallbackPrice),
          change24h: body.change24h === undefined ? undefined : decimal(body.change24h),
          high24h: body.high24h === undefined ? undefined : decimal(body.high24h),
          low24h: body.low24h === undefined ? undefined : decimal(body.low24h),
          volume24h: body.volume24h === undefined ? undefined : decimal(body.volume24h),
          sortOrder: body.sortOrder === undefined ? undefined : Number(body.sortOrder),
          minOrderAmount: body.minOrderAmount === undefined ? undefined : decimal(body.minOrderAmount),
          pricePrecision: body.pricePrecision === undefined ? undefined : Number(body.pricePrecision),
          amountPrecision: body.amountPrecision === undefined ? undefined : Number(body.amountPrecision),
          useHtxData: body.useHtxData === undefined ? undefined : Boolean(body.useHtxData),
          isActive: body.isActive === undefined ? undefined : Boolean(body.isActive),
        },
      });
      const auditLog = await createAuditLog({ adminId, adminEmail: admin.email, action: "MARKET_UPDATED", targetType: "MarketPair", targetId: id, beforeData: before, afterData: market, reason, request }, tx);
      return { market, auditLog };
    });
    return platformJson(result);
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "Market update failed.", 403);
  }
}
