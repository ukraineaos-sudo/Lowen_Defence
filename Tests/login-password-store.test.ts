/**
 * Tests/login-password-store.test.ts — login 503 when password store blocked
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const getActivePasswordResult = vi.fn();

vi.mock("@/lib/auth/password-store", () => ({
  getActivePasswordResult: (...args: unknown[]) =>
    getActivePasswordResult(...args),
}));

vi.mock("@/lib/auth/csrf", () => ({
  assertSameOrigin: () => true,
}));

vi.mock("@/lib/security/rate-limit", () => ({
  clientIp: () => "127.0.0.1",
  peekRateLimit: () => ({ ok: true }),
  recordRateEvent: () => undefined,
}));

vi.mock("@/lib/env", () => ({
  runtimeEnv: (name: string) =>
    name === "AUTH_SECRET" ? "test-secret-for-login-route-tests" : undefined,
  dataBlobToken: () => undefined,
  mediaBlobToken: () => undefined,
  runtimeEnvAny: () => undefined,
}));

vi.mock("@/lib/auth/session", () => ({
  SESSION_COOKIE: "ld_admin_token",
  createSessionToken: () => "token",
  getAdminUsername: () => "admin",
  isStorageConfigured: () => true,
  sessionCookieOptions: () => ({}),
}));

describe("login route vs password store", () => {
  beforeEach(() => {
    getActivePasswordResult.mockReset();
    vi.resetModules();
  });

  it("password store unavailable → login returns 503", async () => {
    getActivePasswordResult.mockResolvedValue({
      ok: false,
      code: "PASSWORD_STORE_UNAVAILABLE",
      error: "down",
    });

    const { POST } = await import("@/app/api/auth/login/route");
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost" },
      body: JSON.stringify({ username: "admin", password: "x" }),
    });

    const res = await POST(req as never);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.code).toBe("PASSWORD_STORE_UNAVAILABLE");
  });
});
