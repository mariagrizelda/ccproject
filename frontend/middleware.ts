import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public auth routes
  if (pathname.includes("/health") || pathname.startsWith("/auth") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  // Bypass for static files and Next internals
  if (pathname.startsWith("/_next") || pathname.startsWith("/public") || pathname.match(/\.(.*)$/)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("accessToken")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|public).*)",
  ],
};


