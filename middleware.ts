import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("seller_token")?.value;
  const { pathname } = req.nextUrl;
  
  const isAuthPage = pathname.startsWith("/auth");
  const isSuspendedPage = pathname === "/seller/suspended";
  const isOnboardingPage = pathname.startsWith("/seller/onboarding");

  // NOT LOGGED IN
  if (!token) {
    if (!isAuthPage) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.next();
  }

  // LOGGED IN - decode token WITHOUT verification
  // The backend will verify it on API calls
  try {
    // Decode JWT without verification (just parse it)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());

    console.log("🔍 Decoded payload:", payload);
    console.log("👤 Seller status:", payload.sellerStatus);

    // SUSPENDED SELLER
    if (payload.sellerStatus === "SUSPENDED") {
      if (!isSuspendedPage) {
        return NextResponse.redirect(new URL("/seller/suspended", req.url));
      }
      return NextResponse.next();
    }

    // PENDING SELLER (awaiting approval)
    if (payload.sellerStatus === "PENDING") {
      if (!isOnboardingPage && !isAuthPage) {
        return NextResponse.redirect(new URL("/seller/onboarding", req.url));
      }
      return NextResponse.next();
    }

    // APPROVED SELLER
    if (payload.sellerStatus === "APPROVED") {
      // Don't let approved sellers access suspended or onboarding pages
      if (isSuspendedPage || isOnboardingPage) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      
      // Don't let them revisit auth pages
      if (isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // LOGGED IN but trying to access auth pages
    if (isAuthPage) {
      if (payload.sellerStatus === "APPROVED") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } else if (payload.sellerStatus === "PENDING") {
        return NextResponse.redirect(new URL("/seller/onboarding", req.url));
      } else if (payload.sellerStatus === "SUSPENDED") {
        return NextResponse.redirect(new URL("/seller/suspended", req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Token is malformed or invalid - clear it and redirect to login
    console.error("❌ Token decode failed:", error);
    const response = NextResponse.redirect(new URL("/auth/login", req.url));
    response.cookies.delete("seller_token");
    return response;
  }
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
    "/sales/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/auth/:path*",
  ],
};
