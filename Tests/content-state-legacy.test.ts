/**
 * Tests/content-state-legacy.test.ts — legacy ensure marker (mock Blob)
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
  runtimeEnv: () => undefined,
  runtimeEnvAny: () => undefined,
}));

describe("ensureContentStateMarker (legacy)", () => {
  beforeEach(() => {
    listMock.mockReset();
    putMock.mockReset();
    vi.resetModules();
  });

  it("creates state marker for legacy existing content", async () => {
    // marker not_found
    listMock.mockResolvedValueOnce({ blobs: [] });
    putMock.mockResolvedValueOnce({ url: "https://blob/state" });

    const { ensureContentStateMarker } = await import("@/lib/content/store");
    const result = await ensureContentStateMarker("2026-07-26T12:00:00.000Z");

    expect(result.ensured).toBe(true);
    expect(putMock).toHaveBeenCalledTimes(1);
    const [pathname, body] = putMock.mock.calls[0]!;
    expect(pathname).toBe("content/state.json");
    const parsed = JSON.parse(String(body));
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.lastContentUpdatedAt).toBe("2026-07-26T12:00:00.000Z");
  });

  it("does nothing when marker already found", async () => {
    listMock.mockResolvedValueOnce({
      blobs: [
        {
          pathname: "content/state.json",
          url: "https://blob/state",
        },
      ],
    });
    // fetch for marker body
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          schemaVersion: 1,
          initializedAt: "2026-01-01T00:00:00.000Z",
          lastContentUpdatedAt: "2026-01-01T00:00:00.000Z",
        }),
        { status: 200 }
      )
    );

    const { ensureContentStateMarker } = await import("@/lib/content/store");
    const result = await ensureContentStateMarker("2026-07-26T12:00:00.000Z");

    expect(result.ensured).toBe(true);
    expect(putMock).not.toHaveBeenCalled();
    fetchMock.mockRestore();
  });
});
