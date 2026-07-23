/**
 * auth/login ? ????, Set-Cookie ?????
 * Rate limit ?? ??????? ?????? (per IP).
 */
import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { verifyPassword } from "@/lib/auth/password";
import { getActivePasswordHash } from "@/lib/auth/password-store";
import {
  SESSION_COOKIE,
  createSessionToken,
  getAdminUsername,
  isStorageConfigured,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { runtimeEnv } from "@/lib/env";
import {
  clientIp,
  peekRateLimit,
  recordRateEvent,
} from "@/lib/security/rate-limit";

const LOGIN_FAIL_LIMIT = 8;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 8 ?????? / 15 ?? / IP

// --- 1. ????????? ?????? ? Set-Cookie ????? ---
export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "???????? Origin" }, { status: 403 });
  }

  const ip = clientIp(req);
  const failKey = `login-fail:${ip}`;
  const blocked = peekRateLimit({
    key: failKey,
    limit: LOGIN_FAIL_LIMIT,
    windowMs: LOGIN_WINDOW_MS,
  });
  if (!blocked.ok) {
    return NextResponse.json(
      { error: "???????? ????? ?????. ????????? ???????." },
      {
        status: 429,
        headers: { "Retry-After": String(blocked.retryAfterSec) },
      }
    );
  }

  const secret = runtimeEnv("AUTH_SECRET");
  const passwordHash = await getActivePasswordHash();

  if (!secret || !passwordHash) {
    return NextResponse.json(
      { error: "??????????? ?? ??????????? (???????? AUTH_SECRET / ??????)" },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const username = String(body.username || "");
  const password = String(body.password || "");
  const adminUser = getAdminUsername();

  if (username === adminUser && verifyPassword(password, passwordHash)) {
    const token = createSessionToken(username);
    if (!token) {
      return NextResponse.json({ error: "??????? ????????? ?????" }, { status: 500 });
    }
    const res = NextResponse.json({ success: true, username });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  }

  recordRateEvent({ key: failKey, windowMs: LOGIN_WINDOW_MS });

  return NextResponse.json(
    { error: "??????? ??'? ??????????? ??? ??????" },
    { status: 401 }
  );
}

export async function GET() {
  return NextResponse.json({ storageConfigured: isStorageConfigured() });
}
