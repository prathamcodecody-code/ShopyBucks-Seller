import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("seller_token")?.value;
  const pathname = req.nextUrl.pathname;

  const isAuthPage = pathname.startsWith("/auth");
  const isProtectedPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/seller") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/orders");

  // ❌ Not logged in → block protected pages
  if (!token && isProtectedPage) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // ✅ Logged in → prevent going back to login
  if (token && isAuthPage) {
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
    "/auth/:path*",
  ],
};
