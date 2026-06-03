import { getHtxKlines } from "@/lib/htx-market";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get("symbol") ?? "btcusdt";
  const period = url.searchParams.get("period") ?? "1min";
  const size = Number(url.searchParams.get("size") ?? "200");

  return Response.json(await getHtxKlines(symbol, period, size));
}
