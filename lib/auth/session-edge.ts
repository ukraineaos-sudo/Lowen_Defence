/**
 * lib/auth/session-edge.ts — перевірка сесії в Edge (middleware)
 * Web Crypto HMAC; без Node crypto.
 */

export const SESSION_COOKIE = "ld_admin_token";

export type SessionPayload = {
  u: string;
  exp: number;
};

/** 1. Допоміжні: bytes ↔ base64url / utf8. */
function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToUtf8(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** 2. Перевірити підписаний cookie-токен (HMAC-SHA256 + TTL). */
export async function verifySessionTokenEdge(
  token: string | undefined | null,
  secret: string
): Promise<SessionPayload | null> {
  if (!token || !secret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body)
  );
  const expected = bytesToBase64Url(new Uint8Array(signature));
  if (sig.length !== expected.length) return null;
  let ok = true;
  for (let i = 0; i < sig.length; i++) {
    if (sig[i] !== expected[i]) ok = false;
  }
  if (!ok) return null;

  try {
    const payload = JSON.parse(base64UrlToUtf8(body)) as SessionPayload;
    if (!payload?.u || !payload?.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
