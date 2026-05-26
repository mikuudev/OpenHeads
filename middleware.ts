import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guestCookie = request.cookies.get("openheads_guest")?.value;
  const isGuest = !!guestCookie;
  const isAuthenticated = !!user || isGuest;

  if (pathname.startsWith("/auth/")) {
    if (isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/discovery";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (pathname === "/") {
    if (isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/discovery";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const protectedPaths = [
    "/profile",
    "/favorites",
    "/settings",
    "/packs/new",
  ];
  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.png$).*)",
  ],
};
