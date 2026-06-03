import { AmlStatus, DepositSourceType, DepositStatus, Prisma } from "@prisma/client";
import { assertCanTrade, checkAmlRequired } from "@/lib/compliance";
import { prisma } from "@/lib/prisma";
import { getAmlProvider, getPaymentProvider } from "@/lib/providers";
import { errorJson, readJson, platformJson } from "../../_utils";

function normalizeSourceType(value: unknown): DepositSourceType {
  const source = String(value ?? "CARD").toUpperCase();
  if (source === "BANK_TRANSFER") return DepositSourceType.BANK_TRANSFER;
  if (source === "CRYPTO") return DepositSourceType.CRYPTO;
  return DepositSourceType.CARD;
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const userId = String(body.userId ?? "");
  const asset = String(body.asset ?? "USDT").toUpperCase();
  const network = String(body.network ?? "SANDBOX").toUpperCase();
  const amount = new Prisma.Decimal(String(body.amount ?? "0"));
  const sourceType = normalizeSourceType(body.sourceType);
  const txHash = body.txHash ? String(body.txHash) : undefined;

  if (!userId) return errorJson("userId is required.");
  if (amount.lte(0)) return errorJson("Deposit amount must be positive.");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return errorJson("User not found.", 404);

  try {
    assertCanTrade(user, "deposit");
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : "Deposit blocked.", 403);
  }

  const intent = await getPaymentProvider().createDepositIntent({ userId, asset, amount: Number(amount), sourceType });
  const amlRequired = checkAmlRequired(asset, Number(amount));
  const aml = amlRequired
    ? await getAmlProvider().screenTransaction({ asset, amount: Number(amount), txHash })
    : { platform: true, provider: "mock-aml", status: "NOT_REQUIRED", riskScore: 0 };

  const deposit = await prisma.depositRequest.create({
    data: {
      userId,
      asset,
      network,
      amount,
      sourceType,
      provider: intent.provider ?? "mock-payment",
      providerRef: intent.referenceId,
      txHash,
      status: DepositStatus.PENDING,
      amlStatus: amlRequired ? AmlStatus.PENDING : AmlStatus.NOT_REQUIRED,
    },
  });

  return platformJson({ deposit, intent, amlRequired, aml, status: deposit.status });
}
