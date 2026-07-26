/**
 * Tests/storage-status.test.ts — Data + Media окремо
 */
import { afterEach, describe, expect, it } from "vitest";
import { getStorageStatus, isStorageConfigured } from "@/lib/auth/session";

describe("getStorageStatus", () => {
  const prevData = process.env.DATA_BLOB_READ_WRITE_TOKEN;
  const prevMedia = process.env.MEDIA_BLOB_READ_WRITE_TOKEN;

  afterEach(() => {
    if (prevData === undefined) delete process.env.DATA_BLOB_READ_WRITE_TOKEN;
    else process.env.DATA_BLOB_READ_WRITE_TOKEN = prevData;
    if (prevMedia === undefined) delete process.env.MEDIA_BLOB_READ_WRITE_TOKEN;
    else process.env.MEDIA_BLOB_READ_WRITE_TOKEN = prevMedia;
  });

  it("ready only when both tokens set", () => {
    delete process.env.DATA_BLOB_READ_WRITE_TOKEN;
    delete process.env.MEDIA_BLOB_READ_WRITE_TOKEN;
    expect(getStorageStatus().ready).toBe(false);
    expect(isStorageConfigured()).toBe(false);

    process.env.MEDIA_BLOB_READ_WRITE_TOKEN = "media-token";
    expect(getStorageStatus().media.configured).toBe(true);
    expect(getStorageStatus().data.configured).toBe(false);
    expect(getStorageStatus().ready).toBe(false);

    process.env.DATA_BLOB_READ_WRITE_TOKEN = "data-token";
    expect(getStorageStatus().ready).toBe(true);
    expect(isStorageConfigured()).toBe(true);
  });
});
