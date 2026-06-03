import { NextResponse } from "next/server";

const ACCESS_COOKIE = "exchange_access";
const ACCESS_GRANTED_VALUE = "granted";
const DEFAULT_ACCESS_CODE = "NOVAXDEMO2026";
const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const code = String(body.code ?? "").trim();
  const expectedCode = process.env.EXCHANGE_ACCESS_CODE ?? DEFAULT_ACCESS_CODE;

  if (code !== expectedCode) {
    return NextResponse.json({ ok: false, message: "Invalid access code" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ACCESS_COOKIE,
    value: ACCESS_GRANTED_VALUE,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS_SECONDS,
  });

  return response;
}
