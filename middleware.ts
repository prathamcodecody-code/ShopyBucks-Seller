import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("seller_token")?.value;
  const pathname = req.nextUrl.pathname;

  const isAuthPage = pathname.startsWith("/auth");
  const isSellerPage = pathname.startsWith("/seller");

  // ❌ Not logged in → force login
  if (!token && isSellerPage) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // ✅ Logged in → prevent returning to login
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/seller/onboarding", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/seller/:path*",
    "/auth/:path*",
  ],
};
