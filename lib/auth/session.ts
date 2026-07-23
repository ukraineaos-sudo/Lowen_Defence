import { cookies } from "next/headers";
import { signPayload, timingSafeEqualString } from "./password";
import {
  SESSION_COOKIE,
  type SessionPayload,
} from "./session-edge";
import { runtimeEnv, dataBlobToken, mediaBlobToken } from "@/lib/env";

export { SESSION_COOKIE };
export type { SessionPayload };

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function getAuthSecret(): string | null {
  return runtimeEnv("AUTH_SECRET") || null;
}

export function createSessionToken(username: string): string | null {
  const secret = getAuthSecret();
  if (!secret) return null;
  const payload: SessionPayload = {
    u: username,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = signPayload(body, secret);
  return `${body}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const secret = getAuthSecret();
  if (!secret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = signPayload(body, secret);
  if (!timingSafeEqualString(sig, expected)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as SessionPayload;
    if (!payload?.u || !payload?.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions(maxAgeSeconds = SESSION_TTL_MS / 1000) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export function isStorageConfigured(): boolean {
  return Boolean(dataBlobToken() || mediaBlobToken());
}

export function getAdminUsername(): string {
  return runtimeEnv("ADMIN_USERNAME") || "admin";
}
