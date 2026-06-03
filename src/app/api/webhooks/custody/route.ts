import { getCustodyProvider } from "@/lib/providers";
import { platformJson } from "../../_utils";

export async function POST() {
  const status = await getCustodyProvider().getTransactionStatus("platform-custody-webhook");
  return platformJson({ status });
}

