/**
 * Tests/content-concurrency.test.ts — OCC: ETag / ifMatch / local revision
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultSiteContent } from "@/src/data/default-site-content";

const listMock = vi.fn();
const putMock = vi.fn();
const getMock = vi.fn();
const delMock = vi.fn();

class MockBlobPreconditionFailedError extends Error {
  constructor() {
    super("precondition failed");
    this.name = "BlobPreconditionFailedError";
  }
}

vi.mock("@vercel/blob", () => ({
  list: (...args: unknown[]) => listMock(...args),
  put: (...args: unknown[]) => putMock(...args),
  get: (...args: unknown[]) => getMock(...args),
  del: (...args: unknown[]) => delMock(...args),
  BlobPreconditionFailedError: MockBlobPreconditionFailedError,
}));

vi.mock("@/lib/env", () => ({
  dataBlobToken: () => "test-data-token",
  mediaBlobToken: () => undefined,
  runtimeEnv: () => undefined,
  runtimeEnvAny: () => undefined,
}));

function blobGetOk(content: unknown, etag: string) {
  const body = JSON.stringify(content);
  return {
    statusCode: 200 as const,
    stream: new Response(body).body!,
    blob: {
      etag,
      pathname: "content/current/site-content.json",
      url: "https://blob.example/content/current/site-content.json",
      uploadedAt: new Date("2026-07-26T12:00:00.000Z"),
    },
  };
}

describe("content OCC (Blob)", () => {
  beforeEach(() => {
    listMock.mockReset();
    putMock.mockReset();
    getMock.mockReset();
    delMock.mockReset();
    vi.resetModules();
  });

  it("Blob read returns content and ETag", async () => {
    getMock.mockResolvedValueOnce(blobGetOk(defaultSiteContent, '"etag-v10"'));
    const { readFromBlob } = await import("@/lib/content/store");
    const result = await readFromBlob();
    expect(result.status).toBe("found");
    if (result.status === "found") {
      expect(result.revision).toBe('"etag-v10"');
      expect(result.content.schemaVersion).toBe(1);
    }
  });

  it("Save with current ETag calls put with ifMatch and returns new ETag", async () => {
    getMock.mockResolvedValueOnce(blobGetOk(defaultSiteContent, '"etag-v10"'));
    putMock
      .mockResolvedValueOnce({ etag: '"hist"' }) // history
      .mockResolvedValueOnce({ etag: '"etag-v11"' }) // current
      .mockResolvedValueOnce({ etag: '"state"' }); // state marker
    listMock
      .mockResolvedValueOnce({ blobs: [] }) // history prune list
      .mockResolvedValueOnce({ blobs: [] }); // readContentStateFromBlob

    const { writeSiteContent } = await import("@/lib/content/store");
    const result = await writeSiteContent(defaultSiteContent, '"etag-v10"');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.revision).toBe('"etag-v11"');
    }

    const currentPut = putMock.mock.calls.find(
      (c) => c[0] === "content/current/site-content.json"
    );
    expect(currentPut).toBeTruthy();
    expect(currentPut![2]).toMatchObject({
      ifMatch: '"etag-v10"',
      allowOverwrite: true,
    });
  });

  it("stale ETag returns CONTENT_CONFLICT without writing current", async () => {
    getMock.mockResolvedValueOnce(blobGetOk(defaultSiteContent, '"etag-v11"'));
    const { writeSiteContent } = await import("@/lib/content/store");
    const result = await writeSiteContent(defaultSiteContent, '"etag-v10"');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe("CONTENT_CONFLICT");
    }
    expect(
      putMock.mock.calls.some(
        (c) => c[0] === "content/current/site-content.json"
      )
    ).toBe(false);
  });

  it("BlobPreconditionFailedError maps to CONTENT_CONFLICT; marker not written", async () => {
    getMock.mockResolvedValueOnce(blobGetOk(defaultSiteContent, '"etag-v10"'));
    putMock
      .mockResolvedValueOnce({ etag: '"hist"' })
      .mockRejectedValueOnce(new MockBlobPreconditionFailedError());
    listMock.mockResolvedValueOnce({ blobs: [] });

    const { writeSiteContent } = await import("@/lib/content/store");
    const result = await writeSiteContent(defaultSiteContent, '"etag-v10"');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe("CONTENT_CONFLICT");
    }
    expect(
      putMock.mock.calls.some((c) => c[0] === "content/state.json")
    ).toBe(false);
  });

  it("first Save does not use allowOverwrite: true", async () => {
    getMock.mockResolvedValueOnce(null);
    putMock
      .mockResolvedValueOnce({ etag: '"etag-v1"' })
      .mockResolvedValueOnce({ etag: '"state"' });
    listMock.mockResolvedValueOnce({ blobs: [] });

    const { writeSiteContent } = await import("@/lib/content/store");
    const result = await writeSiteContent(defaultSiteContent, null);

    expect(result.success).toBe(true);
    const currentPut = putMock.mock.calls.find(
      (c) => c[0] === "content/current/site-content.json"
    );
    expect(currentPut).toBeTruthy();
    expect(currentPut![2]?.allowOverwrite).toBeUndefined();
    expect(currentPut![2]?.ifMatch).toBeUndefined();
  });

  it("first concurrent Save becomes CONFLICT when object already exists", async () => {
    getMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(blobGetOk(defaultSiteContent, '"etag-other"'));
    putMock.mockRejectedValueOnce(new Error("already exists"));

    const { writeSiteContent } = await import("@/lib/content/store");
    const result = await writeSiteContent(defaultSiteContent, null);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe("CONTENT_CONFLICT");
    }
  });
});

describe("content API 409", () => {
  beforeEach(() => {
    listMock.mockReset();
    putMock.mockReset();
    getMock.mockReset();
    vi.resetModules();
  });

  it("POST returns 409 on CONTENT_CONFLICT", async () => {
    getMock.mockResolvedValueOnce(blobGetOk(defaultSiteContent, '"etag-v11"'));

    vi.doMock("@/lib/auth/csrf", () => ({
      assertSameOrigin: () => true,
    }));
    vi.doMock("@/lib/auth/session", () => ({
      getSessionFromCookies: async () => ({ u: "admin", pv: "x" }),
    }));

    const { POST } = await import("@/app/api/admin/content/route");
    const req = new Request("http://localhost/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expectedRevision: '"etag-v10"',
        content: defaultSiteContent,
      }),
    });

    const res = await POST(req as never);
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.code).toBe("CONTENT_CONFLICT");
  });
});
