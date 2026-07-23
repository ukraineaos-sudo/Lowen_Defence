/**
 * lib/auth/csrf.ts — захист від CSRF
 * Перевірка Origin/Referer на мутуючих admin/auth запитах.
 */
import { NextRequest } from "next/server";

/** 1. Чи запит з того ж origin (або дозволений у dev без Origin). */
export function assertSameOrigin(req: NextRequest): boolean {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return true;
  }

  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  const siteUrl = process.env.SITE_URL?.replace(/\/$/, "");

  // 1a. Origin збігається з Host / SITE_URL
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost === host) return true;
      if (siteUrl && new URL(siteUrl).host === originHost) return true;
    } catch {
      return false;
    }
  }

  // 1b. Fallback на Referer
  const referer = req.headers.get("referer");
  if (referer && host) {
    try {
      const refHost = new URL(referer).host;
      if (refHost === host) return true;
      if (siteUrl && new URL(siteUrl).host === refHost) return true;
    } catch {
      return false;
    }
  }

  // 1c. Локальні інструменти без Origin
  if (process.env.NODE_ENV !== "production" && !origin) {
    return true;
  }

  return false;
}
