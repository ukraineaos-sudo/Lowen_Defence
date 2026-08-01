/**
 * Tests/content-concurrency-local.test.ts — local updatedAt OCC (без Blob token)
 */
import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultSiteContent } from "@/src/data/default-site-content";

vi.mock("@/lib/env", () => ({
  dataBlobToken: () => undefined,
  mediaBlobToken: () => undefined,
  runtimeEnv: () => undefined,
  runtimeEnvAny: () => undefined,
}));

describe("content OCC (local)", () => {
  let tmp: string;
  let cwdSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ldu-content-"));
    cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(tmp);
    vi.resetModules();
  });

  afterEach(() => {
    cwdSpy.mockRestore();
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it(
    "local revision mismatch returns CONFLICT",
    async () => {
    const dataDir = path.join(tmp, "data");
    fs.mkdirSync(dataDir, { recursive: true });
    const content = {
      ...structuredClone(defaultSiteContent),
      updatedAt: "2026-07-26T10:00:00.000Z",
    };
    fs.writeFileSync(
      path.join(dataDir, "site-content.json"),
      JSON.stringify(content, null, 2),
      "utf-8"
    );

    const { writeSiteContent } = await import("@/lib/content/store");
    const result = await writeSiteContent(
      content,
      "2026-07-26T09:00:00.000Z"
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe("CONTENT_CONFLICT");
    }

    const onDisk = JSON.parse(
      fs.readFileSync(path.join(dataDir, "site-content.json"), "utf-8")
    );
    expect(onDisk.updatedAt).toBe("2026-07-26T10:00:00.000Z");
  },
    15000
  );

  it("local matching revision writes and returns new updatedAt revision", async () => {
    const dataDir = path.join(tmp, "data");
    fs.mkdirSync(dataDir, { recursive: true });
    const content = {
      ...structuredClone(defaultSiteContent),
      updatedAt: "2026-07-26T10:00:00.000Z",
    };
    fs.writeFileSync(
      path.join(dataDir, "site-content.json"),
      JSON.stringify(content, null, 2),
      "utf-8"
    );

    const { writeSiteContent } = await import("@/lib/content/store");
    const result = await writeSiteContent(
      content,
      "2026-07-26T10:00:00.000Z"
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.revision).toBe(result.content.updatedAt);
      expect(result.revision).not.toBe("2026-07-26T10:00:00.000Z");
    }
  });
});
