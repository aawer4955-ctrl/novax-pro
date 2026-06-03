import { createDefaultAdminIfMissing, safeUser, verifyUserPassword } from "@/lib/db-auth";
import { errorJson, readJson, platformJson } from "../../_utils";

export async function POST(request: Request) {
  const body = await readJson(request);
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) return errorJson("Email and password are required.");

  await createDefaultAdminIfMissing();

  const user = await verifyUserPassword(email, password);
  if (!user) return errorJson("Invalid email or password.", 401);

  return platformJson({ message: "Login accepted in database platform.", user: safeUser(user) });
}
