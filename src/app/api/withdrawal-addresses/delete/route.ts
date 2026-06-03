import { deleteWithdrawalAddress } from "@/lib/address-book";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return Response.json({ deleted: deleteWithdrawalAddress(body.id, body.userId) });
}
