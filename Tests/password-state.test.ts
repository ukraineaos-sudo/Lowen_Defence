/**
 * Tests/password-state.test.ts — pure policy hash × marker
 */
import { describe, expect, it } from "vitest";
import {
  isSupportedPasswordHash,
  parsePasswordState,
  resolvePasswordBootstrap,
  type PasswordState,
} from "@/lib/auth/password-state";

const sampleState: PasswordState = {
  schemaVersion: 1,
  initializedAt: "2026-07-26T10:00:00.000Z",
  lastChangedAt: "2026-07-26T10:00:00.000Z",
};

const validHash = "scrypt:deadbeef:cafebabe";

describe("resolvePasswordBootstrap", () => {
  it("found hash + any marker → use_hash", () => {
    expect(
      resolvePasswordBootstrap(
        { status: "found", hash: validHash },
        { status: "not_found" }
      )
    ).toEqual({ status: "use_hash", hash: validHash });

    expect(
      resolvePasswordBootstrap(
        { status: "found", hash: validHash },
        { status: "found", state: sampleState }
      ).status
    ).toBe("use_hash");
  });

  it("not_found hash + not_found marker → bootstrap", () => {
    expect(
      resolvePasswordBootstrap(
        { status: "not_found" },
        { status: "not_found" }
      )
    ).toEqual({ status: "bootstrap" });
  });

  it("not_found hash + found marker → PASSWORD_HASH_MISSING", () => {
    const d = resolvePasswordBootstrap(
      { status: "not_found" },
      { status: "found", state: sampleState }
    );
    expect(d).toEqual({
      status: "blocked",
      code: "PASSWORD_HASH_MISSING",
    });
  });

  it("not_found hash + unavailable marker → blocked", () => {
    const d = resolvePasswordBootstrap(
      { status: "not_found" },
      { status: "unavailable" }
    );
    expect(d).toEqual({
      status: "blocked",
      code: "PASSWORD_STORE_UNAVAILABLE",
    });
  });

  it("unavailable hash → blocked regardless of marker", () => {
    expect(
      resolvePasswordBootstrap(
        { status: "unavailable" },
        { status: "found", state: sampleState }
      )
    ).toEqual({
      status: "blocked",
      code: "PASSWORD_STORE_UNAVAILABLE",
    });
  });

  it("empty / corrupted hash → corrupted, never bootstrap", () => {
    const d = resolvePasswordBootstrap(
      { status: "corrupted", error: "empty" },
      { status: "not_found" }
    );
    expect(d).toEqual({
      status: "blocked",
      code: "PASSWORD_HASH_CORRUPTED",
    });
  });

  it("unsupported hash format helpers", () => {
    expect(isSupportedPasswordHash("scrypt:a:b")).toBe(true);
    expect(isSupportedPasswordHash("pbkdf2:1:a:b")).toBe(true);
    expect(isSupportedPasswordHash("sha256:x")).toBe(false);
    expect(isSupportedPasswordHash("")).toBe(false);
  });
});

describe("parsePasswordState", () => {
  it("corrupted state is not not_found", () => {
    expect(parsePasswordState({ schemaVersion: 2 }).status).toBe("corrupted");
  });

  it("accepts valid state", () => {
    const r = parsePasswordState(sampleState);
    expect(r.status).toBe("found");
  });
});
