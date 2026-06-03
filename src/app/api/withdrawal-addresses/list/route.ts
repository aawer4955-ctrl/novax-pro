import { listWithdrawalAddresses } from "@/lib/address-book";

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId") ?? undefined;
  return Response.json({ addresses: listWithdrawalAddresses(userId) });
}
