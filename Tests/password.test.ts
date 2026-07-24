/**
 * Tests/password.test.ts — хеш / перевірка пароля / HMAC
 */
import { describe, expect, it } from "vitest";
import {
  generateAuthSecret,
  hashPassword,
  signPayload,
  timingSafeEqualString,
  verifyPassword,
} from "@/lib/auth/password";

describe("password crypto", () => {
  it("hashPassword → scrypt: format and verifyPassword ok", () => {
    const hash = hashPassword("CorrectHorseBattery");
    expect(hash.startsWith("scrypt:")).toBe(true);
    expect(verifyPassword("CorrectHorseBattery", hash)).toBe(true);
    expect(verifyPassword("wrong", hash)).toBe(false);
  });

  it("verifyPassword rejects empty / garbage", () => {
    expect(verifyPassword("x", "")).toBe(false);
    expect(verifyPassword("x", undefined)).toBe(false);
    expect(verifyPassword("x", "scrypt:bad")).toBe(false);
  });

  it("signPayload is stable for same input", () => {
    const a = signPayload("body", "secret-1");
    const b = signPayload("body", "secret-1");
    expect(a).toBe(b);
    expect(signPayload("body", "secret-2")).not.toBe(a);
  });

  it("timingSafeEqualString", () => {
    expect(timingSafeEqualString("ab", "ab")).toBe(true);
    expect(timingSafeEqualString("ab", "ac")).toBe(false);
    expect(timingSafeEqualString("a", "ab")).toBe(false);
  });

  it("generateAuthSecret length", () => {
    expect(generateAuthSecret()).toHaveLength(64);
  });
});
