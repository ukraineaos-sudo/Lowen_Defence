/**
 * Tests/media-storage.test.ts — fail-closed media + signature checks
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const putMock = vi.fn();
const mkdirSyncMock = vi.fn();
const writeFileSyncMock = vi.fn();
let mediaTokenValue: string | undefined;

vi.mock("@vercel/blob", () => ({
  put: (...args: unknown[]) => putMock(...args),
}));

vi.mock("fs", () => ({
  default: {
    mkdirSync: (...args: unknown[]) => mkdirSyncMock(...args),
    writeFileSync: (...args: unknown[]) => writeFileSyncMock(...args),
  },
}));

vi.mock("@/lib/env", () => ({
  mediaBlobToken: () => mediaTokenValue,
  dataBlobToken: () => undefined,
  runtimeEnv: () => undefined,
  runtimeEnvAny: () => undefined,
}));

const PNG_BYTES = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);
const JPEG_BYTES = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
const WEBP_BYTES = Buffer.concat([
  Buffer.from("RIFF"),
  Buffer.from([0x10, 0x00, 0x00, 0x00]),
  Buffer.from("WEBP"),
  Buffer.from([0x00, 0x00, 0x00, 0x00]),
]);

function dataUrl(mime: string, buf: Buffer): string {
  return `data:${mime};base64,${buf.toString("base64")}`;
}

const PNG_DATA_URL = dataUrl("image/png", PNG_BYTES);

describe("detectImageFormat / decodeImageDataUrl", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("recognizes real JPEG/PNG/WebP signatures", async () => {
    const { detectImageFormat } = await import("@/lib/blob/detect-image-format");
    expect(detectImageFormat(JPEG_BYTES).ok).toBe(true);
    expect(detectImageFormat(PNG_BYTES).ok).toBe(true);
    expect(detectImageFormat(WEBP_BYTES).ok).toBe(true);
  });

  it("rejects random/empty buffers", async () => {
    const { detectImageFormat } = await import("@/lib/blob/detect-image-format");
    expect(detectImageFormat(Buffer.from("hello")).ok).toBe(false);
    expect(detectImageFormat(Buffer.alloc(0)).ok).toBe(false);
  });

  it("PNG declared as JPEG → IMAGE_MIME_MISMATCH", async () => {
    const { decodeImageDataUrl } = await import("@/lib/blob/media");
    const result = decodeImageDataUrl(dataUrl("image/jpeg", PNG_BYTES));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.code).toBe("IMAGE_MIME_MISMATCH");
  });

  it("invalid base64 / svg / oversized rejected", async () => {
    const { decodeImageDataUrl, MAX_UPLOAD_BYTES } = await import(
      "@/lib/blob/media"
    );
    expect(decodeImageDataUrl("not-a-data-url").success).toBe(false);
    const svg = decodeImageDataUrl(
      `data:image/svg+xml;base64,${Buffer.from("<svg/>").toString("base64")}`
    );
    expect(svg.success).toBe(false);
    const badB64 = decodeImageDataUrl("data:image/png;base64,!!!!");
    expect(badB64.success).toBe(false);
    const junk = decodeImageDataUrl(
      dataUrl("image/png", Buffer.from("not-an-image"))
    );
    expect(junk.success).toBe(false);
    if (!junk.success) expect(junk.code).toBe("IMAGE_SIGNATURE_INVALID");

    const big = Buffer.concat([
      PNG_BYTES,
      Buffer.alloc(MAX_UPLOAD_BYTES, 1),
    ]);
    const oversized = decodeImageDataUrl(dataUrl("image/png", big));
    expect(oversized.success).toBe(false);
    if (!oversized.success) expect(oversized.code).toBe("IMAGE_TOO_LARGE");
  });

  it("empty/sanitized folder becomes general", async () => {
    const { createMediaPath } = await import("@/lib/blob/media");
    expect(createMediaPath("@@@", "image/png")).toMatch(/^media\/general\//);
    expect(createMediaPath("", "image/jpeg")).toMatch(/^media\/general\//);
  });
});

describe("storeMediaBuffer / uploadImageFromDataUrl", () => {
  beforeEach(() => {
    putMock.mockReset();
    mkdirSyncMock.mockReset();
    writeFileSyncMock.mockReset();
    mediaTokenValue = undefined;
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("blob success → blob URL, source blob", async () => {
    mediaTokenValue = "media-token";
    putMock.mockResolvedValueOnce({
      url: "https://x.public.blob.vercel-storage.com/media/general/a.png",
    });

    const { uploadImageFromDataUrl } = await import("@/lib/blob/media");
    const result = await uploadImageFromDataUrl(PNG_DATA_URL, "general");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.source).toBe("blob");
      expect(result.url).toContain("vercel-storage.com");
    }
    expect(writeFileSyncMock).not.toHaveBeenCalled();
  });

  it("blob failure → MEDIA_STORAGE_UNAVAILABLE, no local write", async () => {
    mediaTokenValue = "media-token";
    putMock.mockRejectedValueOnce(new Error("blob down"));

    const { uploadImageFromDataUrl } = await import("@/lib/blob/media");
    const result = await uploadImageFromDataUrl(PNG_DATA_URL, "general");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe("MEDIA_STORAGE_UNAVAILABLE");
    }
    expect(writeFileSyncMock).not.toHaveBeenCalled();
  });

  it("signature error does not call Blob put", async () => {
    mediaTokenValue = "media-token";
    const { uploadImageFromDataUrl } = await import("@/lib/blob/media");
    const result = await uploadImageFromDataUrl(
      dataUrl("image/png", Buffer.from("nope")),
      "general"
    );
    expect(result.success).toBe(false);
    expect(putMock).not.toHaveBeenCalled();
  });

  it("production without token → MEDIA_STORAGE_MISSING", async () => {
    mediaTokenValue = undefined;
    vi.stubEnv("NODE_ENV", "production");

    const { uploadImageFromDataUrl } = await import("@/lib/blob/media");
    const result = await uploadImageFromDataUrl(PNG_DATA_URL, "general");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe("MEDIA_STORAGE_MISSING");
    }
    expect(writeFileSyncMock).not.toHaveBeenCalled();
  });

  it("development without token → local write", async () => {
    mediaTokenValue = undefined;
    vi.stubEnv("NODE_ENV", "development");

    const { uploadImageFromDataUrl } = await import("@/lib/blob/media");
    const result = await uploadImageFromDataUrl(PNG_DATA_URL, "team");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.source).toBe("local");
      expect(result.url).toMatch(/^\/uploads\/team\//);
    }
    expect(writeFileSyncMock).toHaveBeenCalledTimes(1);
  });

  it("local write failure → MEDIA_LOCAL_WRITE_FAILED", async () => {
    mediaTokenValue = undefined;
    vi.stubEnv("NODE_ENV", "development");
    writeFileSyncMock.mockImplementationOnce(() => {
      throw new Error("disk full");
    });

    const { uploadImageFromDataUrl } = await import("@/lib/blob/media");
    const result = await uploadImageFromDataUrl(PNG_DATA_URL, "general");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe("MEDIA_LOCAL_WRITE_FAILED");
    }
  });
});

describe("upload route status mapping", () => {
  beforeEach(() => {
    putMock.mockReset();
    writeFileSyncMock.mockReset();
    mediaTokenValue = undefined;
    vi.resetModules();
  });

  async function callRoute(body: unknown) {
    vi.doMock("@/lib/auth/csrf", () => ({
      assertSameOrigin: () => true,
    }));
    vi.doMock("@/lib/auth/session", () => ({
      getSessionFromCookies: async () => ({ u: "admin", pv: "x" }),
    }));
    const { POST } = await import("@/app/api/admin/upload/route");
    const req = new Request("http://localhost/api/admin/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return POST(req as never);
  }

  it("storage failure → HTTP 503", async () => {
    mediaTokenValue = "media-token";
    putMock.mockRejectedValueOnce(new Error("blob down"));

    const res = await callRoute({ dataUrl: PNG_DATA_URL, folder: "general" });
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.code).toBe("MEDIA_STORAGE_UNAVAILABLE");
    expect(data.error.code).toBe("MEDIA_STORAGE_UNAVAILABLE");
  });

  it("invalid image → HTTP 400", async () => {
    const res = await callRoute({ dataUrl: "data:image/svg+xml;base64,x" });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.code).toBe("IMAGE_INVALID");
  });
});
