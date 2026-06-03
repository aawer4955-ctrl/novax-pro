import { getHtxTicker } from "@/lib/htx-market";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get("symbol") ?? "btcusdt";

  return Response.json(await getHtxTicker(symbol));
}
