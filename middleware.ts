/**
 * Middleware — захист /admin + форс локалі публічного сайту
 * Admin: cookie-сесія; без логіну → /admin/login; noindex.
 * Public: `?lang=uk|en` виставляє cookie `ld_locale` і прибирає query (тест без UI).
 */
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionTokenEdge } from "@/lib/auth/session-edge";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  parseLocale,
} from "@/lib/i18n/locale";

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

  // Публічні маршрути (не API): ?lang=en|uk → cookie + redirect без query
  if (!pathname.startsWith("/api")) {
    const forced = parseLocale(req.nextUrl.searchParams.get("lang"));
    if (forced) {
      const url = req.nextUrl.clone();
      url.searchParams.delete("lang");
      const res = NextResponse.redirect(url);
      res.cookies.set(LOCALE_COOKIE, forced, {
        path: "/",
        maxAge: LOCALE_COOKIE_MAX_AGE,
        sameSite: "lax",
      });
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
