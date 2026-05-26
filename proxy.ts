import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedPaths = ["/profile", "/favorites", "/settings", "/packs/new"];

  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    const hasSession = request.cookies.get("sb-session")?.value;
    const hasGuest = request.cookies.get("openheads-guest")?.value;

    if (!hasSession && !hasGuest && !pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/favorites/:path*", "/settings/:path*", "/packs/new/:path*"],
};
