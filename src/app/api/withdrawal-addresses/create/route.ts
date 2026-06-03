import { addWithdrawalAddress } from "@/lib/address-book";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!body.userId) return Response.json({ error: "User not found" }, { status: 404 });
  return Response.json({ address: addWithdrawalAddress({ userId: body.userId, asset: body.asset ?? "USDT", network: body.network ?? "TRC20", label: body.label ?? "Address", address: body.address, memo: body.memo }) });
}
