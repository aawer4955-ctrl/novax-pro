import { DepositAddressStatus } from "@prisma/client";
import { normalizeAsset, normalizeNetwork } from "@/lib/address-validator";
import { prisma } from "@/lib/prisma";
import { readJson } from "../../_utils";

export async function POST(request: Request) {
  const body = await readJson(request);
  const userId = String(body.userId ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const asset = normalizeAsset(String(body.asset ?? "USDT"));
  const network = normalizeNetwork(String(body.network ?? "TRC20"));

  if (!userId && !email) return Response.json({ address: null, message: "Address not assigned yet" });

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(userId ? [{ id: userId }] : []),
        ...(email ? [{ email }] : []),
      ],
    },
  });

  if (!user) return Response.json({ address: null, message: "Address not assigned yet" });

  const record = await prisma.userDepositAddress.findFirst({
    where: { userId: user.id, asset, network, status: DepositAddressStatus.ACTIVE },
    orderBy: { assignedAt: "desc" },
  });

  if (!record) return Response.json({ address: null, message: "Address not assigned yet" });

  return Response.json({
    id: record.id,
    asset: record.asset,
    network: record.network,
    address: record.address,
    memo: record.memo,
    label: record.label,
    assignedAt: record.assignedAt,
  });
}
