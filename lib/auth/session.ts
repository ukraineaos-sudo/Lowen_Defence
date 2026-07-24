/**
 * lib/auth/session.ts — cookie-сесія адміна (Node runtime)
 * Створення/перевірка токена, читання з cookies, прапорці сховища.
 */
import { cookies } from "next/headers";
import { signPayload, timingSafeEqualString } from "./password";
import {
  SESSION_COOKIE,
  type SessionPayload,
} from "./session-edge";
import { getActivePasswordHash } from "./password-store";
import { runtimeEnv, dataBlobToken, mediaBlobToken } from "@/lib/env";

export { SESSION_COOKIE };
export type { SessionPayload };

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function getAuthSecret(): string | null {
  return runtimeEnv("AUTH_SECRET") || null;
}

/** Fingerprint активного пароля (для інвалідації сесій після зміни). */
export function passwordVersion(hash: string, secret: string): string {
  return signPayload(`pv:${hash}`, secret).slice(0, 24);
}

/** 1. Підписати нову сесію (username + exp + версія пароля, 12 год). */
export function createSessionToken(
  username: string,
  passwordHash: string
): string | null {
  const secret = getAuthSecret();
  if (!secret) return null;
  const payload: SessionPayload = {
    u: username,
    exp: Date.now() + SESSION_TTL_MS,
    pv: passwordVersion(passwordHash, secret),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = signPayload(body, secret);
  return `${body}.${sig}`;
}

/** 2. Перевірити токен (Node HMAC). */
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

/** 3. Сесія з HttpOnly cookie поточного запиту (+ перевірка версії пароля). */
export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const payload = verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!payload) return null;

  // Токени з pv інвалідуються після зміни пароля.
  // Старі токени без pv (до впровадження) лишаються дійсними до exp.
  if (payload.pv) {
    const secret = getAuthSecret();
    const hash = secret ? await getActivePasswordHash() : null;
    if (!secret || !hash) return null;
    if (!timingSafeEqualString(payload.pv, passwordVersion(hash, secret))) {
      return null;
    }
  }

  return payload;
}

/** 4. Опції Set-Cookie для логіну. */
export function sessionCookieOptions(maxAgeSeconds = SESSION_TTL_MS / 1000) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** 5. Чи є хоч один Blob-токен (банер у адмінці). */
export function isStorageConfigured(): boolean {
  return Boolean(dataBlobToken() || mediaBlobToken());
}

/** 6. Логін адміна з env (дефолт admin). */
export function getAdminUsername(): string {
  return runtimeEnv("ADMIN_USERNAME") || "admin";
}
