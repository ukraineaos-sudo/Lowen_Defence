/**
 * Tests/rate-limit.test.ts — sliding window
 */
import { describe, expect, it } from "vitest";
import {
  peekRateLimit,
  rateLimit,
  recordRateEvent,
} from "@/lib/security/rate-limit";

describe("rateLimit", () => {
  it("allows until limit, then blocks", () => {
    const key = `test-rl-${Date.now()}-${Math.random()}`;
    const opts = { key, limit: 3, windowMs: 60_000 };

    expect(rateLimit(opts).ok).toBe(true);
    expect(rateLimit(opts).ok).toBe(true);
    expect(rateLimit(opts).ok).toBe(true);

    const blocked = rateLimit(opts);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.retryAfterSec).toBeGreaterThanOrEqual(1);
    }
  });

  it("peekRateLimit does not consume quota", () => {
    const key = `test-peek-${Date.now()}-${Math.random()}`;
    const opts = { key, limit: 1, windowMs: 60_000 };

    expect(peekRateLimit(opts).ok).toBe(true);
    expect(peekRateLimit(opts).ok).toBe(true);
    expect(rateLimit(opts).ok).toBe(true);
    expect(peekRateLimit(opts).ok).toBe(false);
  });

  it("recordRateEvent fills fail counter for login-style use", () => {
    const key = `test-fail-${Date.now()}-${Math.random()}`;
    recordRateEvent({ key, windowMs: 60_000 });
    recordRateEvent({ key, windowMs: 60_000 });
    const peeked = peekRateLimit({ key, limit: 2, windowMs: 60_000 });
    expect(peeked.ok).toBe(false);
  });
});
