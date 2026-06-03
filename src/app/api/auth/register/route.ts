import { createDefaultAdminIfMissing, createUserWithDefaultAssets, findUserByEmail, safeUser } from "@/lib/db-auth";
import { errorJson, readJson, platformJson } from "../../_utils";

export async function POST(request: Request) {
  const body = await readJson(request);
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const country = String(body.country ?? "US");
  const language = String(body.language ?? "en");

  if (!email || !email.includes("@")) return errorJson("Valid email is required.");
  if (password.length < 8) return errorJson("Password must be at least 8 characters.");

  await createDefaultAdminIfMissing();

  const existing = await findUserByEmail(email);
  if (existing) return errorJson("Email is already registered.", 409);

  const user = await createUserWithDefaultAssets({ email, password, country, language });
  return platformJson({ message: "User registered in database platform.", user: safeUser(user) });
}
