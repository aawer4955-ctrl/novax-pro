import { AmlStatus, Prisma, WithdrawalStatus } from "@prisma/client";
import { assertCanTrade, checkWithdrawalLimit } from "@/lib/compliance";
import { freezeBalance } from "@/lib/ledger";
import { prisma } from "@/lib/prisma";
import { getAmlProvider, getCustodyProvider } from "@/lib/providers";
import { errorJson, readJson, platformJson } from "../../_utils";

export async function POST(request: Request) {
  const body = await readJson(request);
  const userId = String(body.userId ?? "");
  const asset = String(body.asset ?? "USDT").toUpperCase();
  const network = String(body.network ?? "SANDBOX").toUpperCase();
  const amount = new Prisma.Decimal(String(body.amount ?? "0"));
  const fee = new Prisma.Decimal(String(body.fee ?? "0"));
  const destinationAddress = String(body.destinationAddress ?? "").trim();

  if (!userId) return errorJson("userId is required.");
  if (!destinationAddress) return errorJson("destinationAddress is required.");
  if (amount.lte(0)) return errorJson("Withdrawal amount must be positive.");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return errorJson("User not found.", 404);

  try {
    assertCanTrade(user, "withdrawal");
    const limit = checkWithdrawalLimit(user, Number(amount));
    if (!limit.allowed) throw new Error(limit.error);
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "Withdrawal blocked.", 403);
  }

  const aml = await getAmlProvider().screenWalletAddress({ asset, network, address: destinationAddress });
  const custody = await getCustodyProvider().requestWithdrawal({ userId, asset, network, amount: Number(amount), destinationAddress });
  const totalToFreeze = amount.plus(fee);

  const withdrawal = await prisma.$transaction(async (tx) => {
    const freeze = await freezeBalance(
      {
        userId,
        asset,
        amount: totalToFreeze,
        referenceType: "WithdrawalRequest",
        referenceId: custody.referenceId,
        status: "PENDING",
      },
      tx,
    );

    const created = await tx.withdrawalRequest.create({
      data: {
        userId,
        asset,
        network,
        amount,
        fee,
        destinationAddress,
        provider: custody.provider ?? "mock-custody",
        providerRef: custody.referenceId,
        amlStatus: AmlStatus.PENDING,
        status: WithdrawalStatus.PENDING,
      },
    });

    return { request: created, freeze };
  });

  return platformJson({ withdrawal: withdrawal.request, custody, aml, freeze: withdrawal.freeze, status: withdrawal.request.status });
}
