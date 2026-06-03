import { getPaymentProvider } from "@/lib/providers";
import { readJson, platformJson } from "../../_utils";

export async function POST(request: Request) {
  const body = await readJson(request);
  const verification = await getPaymentProvider().verifyWebhook(body, request.headers.get("x-signature") ?? undefined);
  return platformJson({ verification });
}

