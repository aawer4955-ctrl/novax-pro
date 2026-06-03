import { AccountStatus, KycStatus, LedgerType, OrderSide, OrderStatus, OrderType, Prisma, RiskLevel, UserRole } from "@prisma/client";
import { checkAccountActive, checkRegionAllowed } from "@/lib/compliance";
import { creditBalance, debitBalance } from "@/lib/ledger";
import { prisma } from "@/lib/prisma";
import { demoHashPassword } from "@/lib/db-auth";
import { errorJson, readJson, platformJson } from "../../_utils";

function normalizeSide(value: unknown): OrderSide {
  return String(value ?? "BUY").toUpperCase() === "SELL" ? OrderSide.SELL : OrderSide.BUY;
}

function normalizeType(value: unknown): OrderType {
  return String(value ?? "MARKET").toUpperCase() === "LIMIT" ? OrderType.LIMIT : OrderType.MARKET;
}

async function resolveUser(input: { userId?: string; email?: string }) {
  if (input.userId) {
    const byId = await prisma.user.findUnique({ where: { id: input.userId } });
    if (byId) return byId;
  }

  const email = String(input.email ?? "user@novax.local").trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        uid: `U${Date.now()}${Math.floor(Math.random() * 1000)}`,
        email,
        passwordHash: demoHashPassword("User123456"),
        country: "US",
        language: "en",
        role: UserRole.USER,
        kycStatus: KycStatus.APPROVED,
        accountStatus: AccountStatus.ACTIVE,
        riskLevel: RiskLevel.LOW,
        termsAcceptedAt: new Date(),
      },
    });

    await tx.assetBalance.createMany({
      data: [
        { userId: user.id, asset: "USDT", available: new Prisma.Decimal(10000), frozen: new Prisma.Decimal(0) },
        { userId: user.id, asset: "BTC", available: new Prisma.Decimal("0.1"), frozen: new Prisma.Decimal(0) },
        { userId: user.id, asset: "ETH", available: new Prisma.Decimal("2"), frozen: new Prisma.Decimal(0) },
        { userId: user.id, asset: "SOL", available: new Prisma.Decimal("20"), frozen: new Prisma.Decimal(0) },
        { userId: user.id, asset: "BNB", available: new Prisma.Decimal("3"), frozen: new Prisma.Decimal(0) },
      ],
      skipDuplicates: true,
    });

    return user;
  });
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const pair = String(body.pair ?? "BTC/USDT").toUpperCase();
  const side = normalizeSide(body.side);
  const type = normalizeType(body.type);
  const amount = new Prisma.Decimal(String(body.amount ?? "0"));
  const price = new Prisma.Decimal(String(body.price ?? "0"));
  const feeRate = new Prisma.Decimal("0.001");

  if (!pair.includes("/")) return errorJson("pair must use BASE/QUOTE format.");
  if (amount.lte(0) || price.lte(0)) return errorJson("amount and price must be positive.");

  const user = await resolveUser({ userId: body.userId ? String(body.userId) : undefined, email: body.email ? String(body.email) : undefined });

  const region = checkRegionAllowed(user.country, "trade");
  if (!region.allowed) return errorJson(region.error, 403);
  const account = checkAccountActive(user);
  if (!account.allowed) return errorJson(account.error, 403);

  const [baseAsset, quoteAsset] = pair.split("/");
  const notional = amount.mul(price);
  const fee = notional.mul(feeRate);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: user.id,
          pair,
          side,
          type,
          amount,
          price,
          total: notional,
          fee,
          filledAmount: amount,
          status: OrderStatus.FILLED,
          regionAllowed: true,
        },
      });

      if (side === OrderSide.BUY) {
        await debitBalance({ userId: user.id, asset: quoteAsset, amount: notional, type: LedgerType.TRADE, referenceType: "Order", referenceId: order.id }, tx);
        await debitBalance({ userId: user.id, asset: quoteAsset, amount: fee, type: LedgerType.FEE, referenceType: "Order", referenceId: order.id }, tx);
        await creditBalance({ userId: user.id, asset: baseAsset, amount, type: LedgerType.TRADE, referenceType: "Order", referenceId: order.id }, tx);
      } else {
        await debitBalance({ userId: user.id, asset: baseAsset, amount, type: LedgerType.TRADE, referenceType: "Order", referenceId: order.id }, tx);
        await creditBalance({ userId: user.id, asset: quoteAsset, amount: notional, type: LedgerType.TRADE, referenceType: "Order", referenceId: order.id }, tx);
        await debitBalance({ userId: user.id, asset: quoteAsset, amount: fee, type: LedgerType.FEE, referenceType: "Order", referenceId: order.id }, tx);
      }

      return order;
    });

    return platformJson({ order: result, userId: user.id, status: result.status });
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "Order failed.", 400);
  }
}
