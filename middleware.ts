import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!pathname.startsWith("/exchange-demo")) {
    return NextResponse.next();
  }

  const hasAccess = request.cookies.get("exchange_access")?.value === "granted";
  if (hasAccess) {
    return NextResponse.next();
  }

  const accessUrl = new URL("/access", request.url);
  accessUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(accessUrl);
}

export const config = {
  matcher: ["/exchange-demo/:path*"],
};
