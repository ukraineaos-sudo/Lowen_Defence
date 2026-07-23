/**
 * lib/security/rate-limit.ts — простий in-memory rate limit
 * На Vercel працює per-isolate (не глобальний кластер), але ріже типовий абʼюз.
 */
import type { NextRequest } from "next/server";

const buckets = new Map<string, number[]>();
const MAX_KEYS = 4000;

function prune(key: string, windowStart: number): number[] {
  const stamps = (buckets.get(key) ?? []).filter((t) => t > windowStart);
  buckets.set(key, stamps);
  return stamps;
}

function maybeShrinkMap(): void {
  if (buckets.size <= MAX_KEYS) return;
  const overflow = buckets.size - MAX_KEYS;
  let i = 0;
  for (const key of buckets.keys()) {
    buckets.delete(key);
    i += 1;
    if (i >= overflow) break;
  }
}

/** 1. IP з proxy-заголовків Vercel / unknown. */
export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 128);
  }
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 128);
  return "unknown";
}

/** 2. Чи вичерпано ліміт (без запису нової події). */
export function peekRateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
}): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const stamps = prune(options.key, now - options.windowMs);
  if (stamps.length >= options.limit) {
    const oldest = stamps[0] ?? now;
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((oldest + options.windowMs - now) / 1000)),
    };
  }
  return { ok: true };
}

/** 3. Sliding window: записати подію, якщо ліміт ще не вичерпано. */
export function rateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
}): { ok: true } | { ok: false; retryAfterSec: number } {
  const peeked = peekRateLimit(options);
  if (!peeked.ok) return peeked;

  const now = Date.now();
  const stamps = prune(options.key, now - options.windowMs);
  stamps.push(now);
  buckets.set(options.key, stamps);
  maybeShrinkMap();
  return { ok: true };
}

/** 4. Записати подію навіть якщо ліміт уже повний (для fail-лічильника логіну). */
export function recordRateEvent(options: {
  key: string;
  windowMs: number;
}): void {
  const now = Date.now();
  const stamps = prune(options.key, now - options.windowMs);
  stamps.push(now);
  buckets.set(options.key, stamps);
  maybeShrinkMap();
}
