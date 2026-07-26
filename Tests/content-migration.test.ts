/**
 * Tests/content-migration.test.ts — audit/migrate SiteContent (pure + apply port)
 */
import { describe, expect, it, vi } from "vitest";
import { defaultSiteContent } from "@/src/data/default-site-content";
import {
  analyzeContentCompatibility,
  applySafeContentMigrations,
} from "@/lib/content/content-migration";
import {
  runContentMigration,
  type ContentMigrationBlobPort,
  type RawContentSnapshot,
} from "@/lib/content/content-migration-apply";
import type { SiteContent } from "@/src/types/content";

function snapshotFrom(raw: unknown, uploadedAt?: Date): RawContentSnapshot {
  return {
    raw,
    rawText: JSON.stringify(raw),
    pathname: "content/current/site-content.json",
    url: "https://blob.example/content/current/site-content.json",
    uploadedAt,
  };
}

describe("analyzeContentCompatibility", () => {
  it("strict-valid content → valid, no changes", () => {
    const result = analyzeContentCompatibility(defaultSiteContent);
    expect(result.status).toBe("valid");
    if (result.status === "valid") {
      expect(result.content.schemaVersion).toBe(1);
    }
  });

  it("wrong order → migratable, normalized by array position", () => {
    const raw = structuredClone(defaultSiteContent);
    raw.courses[0]!.order = 99;
    raw.courses[1]!.order = 1;
    const result = analyzeContentCompatibility(raw);
    expect(result.status).toBe("migratable");
    if (result.status === "migratable") {
      expect(result.migrated.courses.map((c) => c.order)).toEqual(
        raw.courses.map((_, i) => i + 1)
      );
      expect(
        result.changes.some((c) => c.reason === "normalized_by_array_position")
      ).toBe(true);
    }
  });

  it("missing updatedAt + blob uploadedAt → migratable", () => {
    const raw = structuredClone(defaultSiteContent) as unknown as Record<
      string,
      unknown
    >;
    delete raw.updatedAt;
    const uploadedAt = "2026-01-15T10:00:00.000Z";
    const result = analyzeContentCompatibility(raw, {
      blobUploadedAt: uploadedAt,
    });
    expect(result.status).toBe("migratable");
    if (result.status === "migratable") {
      expect(result.migrated.updatedAt).toBe(uploadedAt);
      expect(
        result.changes.some((c) => c.reason === "updatedAt_from_blob_uploadedAt")
      ).toBe(true);
    }
  });

  it("empty mobileUrl is removed", () => {
    const raw = structuredClone(defaultSiteContent);
    raw.courses[0]!.image.mobileUrl = "   ";
    const { data, changes } = applySafeContentMigrations(raw);
    expect(
      changes.some((c) => c.reason === "removed_empty_mobileUrl")
    ).toBe(true);
    const course0 = (data as SiteContent).courses[0]!;
    expect(course0.image.mobileUrl).toBeUndefined();
  });

  it("http: image → blocked", () => {
    const raw = structuredClone(defaultSiteContent);
    raw.courses[0]!.image.url = "http://example.com/image.jpg";
    const result = analyzeContentCompatibility(raw);
    expect(result.status).toBe("blocked");
    if (result.status === "blocked") {
      expect(result.issues.some((i) => i.path.includes("image.url"))).toBe(true);
    }
  });

  it("invalid email → blocked", () => {
    const raw = structuredClone(defaultSiteContent);
    raw.contacts.email = "office@";
    const result = analyzeContentCompatibility(raw);
    expect(result.status).toBe("blocked");
    if (result.status === "blocked") {
      expect(result.issues.some((i) => i.path.includes("email"))).toBe(true);
    }
  });

  it("duplicate course id → blocked", () => {
    const raw = structuredClone(defaultSiteContent);
    raw.courses[1]!.id = raw.courses[0]!.id;
    const result = analyzeContentCompatibility(raw);
    expect(result.status).toBe("blocked");
  });
});

describe("runContentMigration", () => {
  it("dry run never calls put", async () => {
    const raw = structuredClone(defaultSiteContent);
    raw.courses[0]!.order = 42;
    const putRawBackup = vi.fn();
    const putCurrent = vi.fn();
    const putState = vi.fn();
    const port: ContentMigrationBlobPort = {
      readCurrentRaw: async () => snapshotFrom(raw),
      putRawBackup,
      putCurrent,
      putState,
    };

    const result = await runContentMigration({ port, applySafe: false });
    expect(result.status).toBe("dry_run_migratable");
    expect(putRawBackup).not.toHaveBeenCalled();
    expect(putCurrent).not.toHaveBeenCalled();
    expect(putState).not.toHaveBeenCalled();
  });

  it("--apply-safe writes raw backup before current", async () => {
    const raw = structuredClone(defaultSiteContent);
    raw.courses[0]!.order = 42;
    const order: string[] = [];
    let stored: unknown = raw;

    const port: ContentMigrationBlobPort = {
      readCurrentRaw: async () => snapshotFrom(stored),
      putRawBackup: async (pathname, body) => {
        order.push(`backup:${pathname}`);
        expect(JSON.parse(body)).toEqual(raw);
      },
      putCurrent: async (content) => {
        order.push("current");
        stored = content;
      },
      putState: async () => {
        order.push("state");
      },
    };

    const result = await runContentMigration({
      port,
      applySafe: true,
      now: new Date("2026-07-26T12:00:00.000Z"),
    });

    expect(result.status).toBe("applied");
    expect(order[0]?.startsWith("backup:")).toBe(true);
    expect(order[0]).toContain("content/recovery/raw/");
    expect(order.slice(1)).toEqual(["current", "state"]);
  });

  it("backup error → current is not written", async () => {
    const raw = structuredClone(defaultSiteContent);
    raw.courses[0]!.order = 42;
    const putCurrent = vi.fn();
    const putState = vi.fn();
    const port: ContentMigrationBlobPort = {
      readCurrentRaw: async () => snapshotFrom(raw),
      putRawBackup: async () => {
        throw new Error("backup failed");
      },
      putCurrent,
      putState,
    };

    const result = await runContentMigration({ port, applySafe: true });
    expect(result.status).toBe("aborted_backup_failed");
    expect(putCurrent).not.toHaveBeenCalled();
    expect(putState).not.toHaveBeenCalled();
  });

  it("after migration result passes strict stored schema", async () => {
    const raw = structuredClone(defaultSiteContent);
    raw.courses[0]!.order = 7;
    let stored: unknown = raw;
    const port: ContentMigrationBlobPort = {
      readCurrentRaw: async () => snapshotFrom(stored),
      putRawBackup: async () => undefined,
      putCurrent: async (content) => {
        stored = content;
      },
      putState: async () => undefined,
    };

    const result = await runContentMigration({ port, applySafe: true });
    expect(result.status).toBe("applied");
    if (result.status === "applied") {
      expect(result.content.courses[0]!.order).toBe(1);
    }
  });

  it("already valid current is not rewritten", async () => {
    const putRawBackup = vi.fn();
    const putCurrent = vi.fn();
    const putState = vi.fn();
    const port: ContentMigrationBlobPort = {
      readCurrentRaw: async () => snapshotFrom(defaultSiteContent),
      putRawBackup,
      putCurrent,
      putState,
    };

    const result = await runContentMigration({ port, applySafe: true });
    expect(result.status).toBe("noop_valid");
    expect(putRawBackup).not.toHaveBeenCalled();
    expect(putCurrent).not.toHaveBeenCalled();
    expect(putState).not.toHaveBeenCalled();
  });
});
