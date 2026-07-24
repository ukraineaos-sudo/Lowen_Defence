/**
 * Tests/session.test.ts — токен сесії + passwordVersion (pv)
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { hashPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  passwordVersion,
  verifySessionToken,
} from "@/lib/auth/session";

describe("session token + password version", () => {
  const secret = "test-auth-secret-for-vitest-32chars!!";

  beforeEach(() => {
    process.env.AUTH_SECRET = secret;
  });

  afterEach(() => {
    delete process.env.AUTH_SECRET;
  });

  it("passwordVersion changes when hash changes", () => {
    const h1 = hashPassword("one-password");
    const h2 = hashPassword("other-password");
    expect(passwordVersion(h1, secret)).not.toBe(passwordVersion(h2, secret));
    expect(passwordVersion(h1, secret)).toBe(passwordVersion(h1, secret));
  });

  it("createSessionToken embeds pv; verifySessionToken accepts", () => {
    const hash = hashPassword("admin-pass-ok");
    const token = createSessionToken("admin", hash);
    expect(token).toBeTruthy();
    const payload = verifySessionToken(token);
    expect(payload?.u).toBe("admin");
    expect(payload?.pv).toBe(passwordVersion(hash, secret));
    expect(payload!.exp).toBeGreaterThan(Date.now());
  });

  it("tampered token fails", () => {
    const hash = hashPassword("admin-pass-ok");
    const token = createSessionToken("admin", hash)!;
    const [body] = token.split(".");
    expect(verifySessionToken(`${body}.fakesignaturexxxxxxxxxxxxxxx`)).toBeNull();
  });

  it("createSessionToken returns null without AUTH_SECRET", () => {
    delete process.env.AUTH_SECRET;
    expect(createSessionToken("admin", "scrypt:x:y")).toBeNull();
  });
});
