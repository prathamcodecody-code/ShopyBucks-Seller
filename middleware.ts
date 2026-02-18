import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // ✅ Must match the cookie name set in loginWithToken
  const token = req.cookies.get("seller_token")?.value;

  const { pathname } = req.nextUrl;
  const isAuthPage = pathname.startsWith("/auth");

  // NOT LOGGED IN
  if (!token) {
    if (!isAuthPage) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.next();
  }

  // LOGGED IN — don't let them revisit auth pages
  if (isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/seller/:path*",
    "/products/:path*",
    "/orders/:path*",
    "/analytics/:path*",
    "/payouts/:path*",
    "/bank/:path*",
    "/analytics/:path*",
    "/sales/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/auth/:path*",
  ],
};
