import { NextRequest } from "next/server";

/**
 * Reject mutating requests without matching Origin/Referer (basic CSRF).
 */
export function assertSameOrigin(req: NextRequest): boolean {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return true;
  }

  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  const siteUrl = process.env.SITE_URL?.replace(/\/$/, "");

  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost === host) return true;
      if (siteUrl && new URL(siteUrl).host === originHost) return true;
    } catch {
      return false;
    }
  }

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

  // Local tooling / same-origin fetch without Origin in some browsers
  if (process.env.NODE_ENV !== "production" && !origin) {
    return true;
  }

  return false;
}
