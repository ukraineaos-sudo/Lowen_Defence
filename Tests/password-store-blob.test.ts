/**
 * Tests/password-store-blob.test.ts — Blob mode: local ignored, legacy ensure
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const listMock = vi.fn();
const putMock = vi.fn();

vi.mock("@vercel/blob", () => ({
  list: (...args: unknown[]) => listMock(...args),
  put: (...args: unknown[]) => putMock(...args),
  del: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  dataBlobToken: () => "test-data-token",
  mediaBlobToken: () => undefined,
  runtimeEnv: (name: string) =>
    name === "ADMIN_PASSWORD_HASH"
      ? "scrypt:envsalt:envhashvalue0000000000000000000000000000000000000000000000000000"
      : undefined,
  runtimeEnvAny: () => undefined,
}));

describe("password store with Data Blob configured", () => {
  beforeEach(() => {
    listMock.mockReset();
    putMock.mockReset();
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("found legacy hash + missing marker → hash works and ensure is attempted", async () => {
    const hash =
      "scrypt:aabbccddeeff0011:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

    // 1) readHashFromBlob list
    listMock.mockResolvedValueOnce({
      blobs: [{ pathname: "auth/admin-password-hash.txt", url: "https://blob/hash" }],
    });
    // 2) readPasswordStateFromBlob list (parallel with hash in getActive — actually Promise.all)
    // Order of list calls in getActivePasswordResult: hash then state in Promise.all — order not guaranteed!
    // So handle by pathname in mock implementation.
    listMock.mockImplementation(async (opts: { prefix: string }) => {
      if (opts.prefix === "auth/admin-password-hash.txt") {
        return {
          blobs: [
            {
              pathname: "auth/admin-password-hash.txt",
              url: "https://blob/hash",
            },
          ],
        };
      }
      if (opts.prefix === "auth/password-state.json") {
        return { blobs: [] };
      }
      return { blobs: [] };
    });

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("hash")) {
        return new Response(hash, { status: 200 });
      }
      return new Response("{}", { status: 404 });
    });

    putMock.mockResolvedValue({ url: "https://blob/state" });

    const { getActivePasswordResult } = await import("@/lib/auth/password-store");
    const result = await getActivePasswordResult();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.hash).toBe(hash);
      expect(result.source).toBe("blob");
    }
    expect(putMock).toHaveBeenCalled();
    const stateCall = putMock.mock.calls.find(
      (c) => c[0] === "auth/password-state.json"
    );
    expect(stateCall).toBeTruthy();

    fetchMock.mockRestore();
  });

  it("Data Blob configured → local hash is ignored (bootstrap uses env)", async () => {
    listMock.mockImplementation(async () => ({ blobs: [] }));

    const { getActivePasswordResult } = await import("@/lib/auth/password-store");
    const result = await getActivePasswordResult();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.source).toBe("env");
      expect(result.hash.startsWith("scrypt:")).toBe(true);
    }
  });

  it("not_found hash + found marker → PASSWORD_HASH_MISSING", async () => {
    listMock.mockImplementation(async (opts: { prefix: string }) => {
      if (opts.prefix === "auth/admin-password-hash.txt") {
        return { blobs: [] };
      }
      return {
        blobs: [
          {
            pathname: "auth/password-state.json",
            url: "https://blob/pw-state",
          },
        ],
      };
    });

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          schemaVersion: 1,
          initializedAt: "2026-07-26T10:00:00.000Z",
          lastChangedAt: "2026-07-26T10:00:00.000Z",
        }),
        { status: 200 }
      )
    );

    const { getActivePasswordResult } = await import("@/lib/auth/password-store");
    const result = await getActivePasswordResult();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("PASSWORD_HASH_MISSING");
    }

    fetchMock.mockRestore();
  });

  it("empty hash object → corrupted, never bootstrap", async () => {
    listMock.mockImplementation(async (opts: { prefix: string }) => {
      if (opts.prefix === "auth/admin-password-hash.txt") {
        return {
          blobs: [
            {
              pathname: "auth/admin-password-hash.txt",
              url: "https://blob/hash",
            },
          ],
        };
      }
      return { blobs: [] };
    });

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("   ", { status: 200 }));

    const { getActivePasswordResult } = await import("@/lib/auth/password-store");
    const result = await getActivePasswordResult();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("PASSWORD_HASH_CORRUPTED");
    }

    fetchMock.mockRestore();
  });
});
