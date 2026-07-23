/**
 * Middleware — захист /admin
 * Перевіряє cookie-сесію; без логіну редірект на /admin/login; noindex для адмінки.
 */
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionTokenEdge } from "@/lib/auth/session-edge";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");

    if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
      return res;
    }

    const secret = process.env.AUTH_SECRET?.trim();
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const session = secret ? await verifySessionTokenEdge(token, secret) : null;

    if (!session) {
      const login = new URL("/admin/login", req.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }

    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
