import { DepositAddressStatus } from "@prisma/client";
import { normalizeAsset, normalizeNetwork } from "@/lib/address-validator";
import { prisma } from "@/lib/prisma";
import { platformJson } from "../../../_utils";

function parseStatus(value: string | null) {
  const normalized = String(value ?? "").trim().toUpperCase();
  if (normalized === DepositAddressStatus.ACTIVE) return DepositAddressStatus.ACTIVE;
  if (normalized === DepositAddressStatus.DISABLED) return DepositAddressStatus.DISABLED;
  return undefined;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId")?.trim();
  const email = url.searchParams.get("email")?.trim().toLowerCase();
  const asset = url.searchParams.get("asset")?.trim();
  const network = url.searchParams.get("network")?.trim();
  const status = parseStatus(url.searchParams.get("status"));

  const depositAddresses = await prisma.userDepositAddress.findMany({
    where: {
      ...(userId ? { userId } : {}),
      ...(email ? { user: { email: { contains: email, mode: "insensitive" } } } : {}),
      ...(asset ? { asset: normalizeAsset(asset) } : {}),
      ...(network ? { network: normalizeNetwork(network) } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      user: { select: { id: true, uid: true, email: true, kycStatus: true, accountStatus: true } },
      assignedByAdmin: { select: { id: true, uid: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return platformJson({ depositAddresses });
}
