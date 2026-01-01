// middleware.ts (root of project)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const url = req.nextUrl.clone();

  // protect everything under /admin (except /admin/_next assets)
  if (pathname.startsWith("/admin")) {
    // allow next internals /assets
    if (pathname.startsWith("/admin/_next")) {
      return NextResponse.next();
    }

    // read cookie (check a few possible names)
    const token =
      req.cookies.get("token")?.value ??
      req.cookies.get("access_token")?.value ??
      req.cookies.get("auth_token")?.value;

    // If the user is trying to open the login page but already has a token,
    // redirect them away (to returnTo if present, else /admin/dashboard).
    if (pathname === "/admin/login") {
      if (token) {
        const returnTo =
          req.nextUrl.searchParams.get("returnTo") || "/admin/dashboard";
        url.pathname = returnTo;
        // If returnTo contains search params you may want to preserve them here
        return NextResponse.redirect(url);
      }
      // No token — show login page
      return NextResponse.next();
    }

    // For other /admin pages: require token, otherwise redirect to login.
    if (!token) {
      url.pathname = "/admin/login";
      url.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(url);
    }

    // token exists => allow through (you can verify token later in server-side)
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
