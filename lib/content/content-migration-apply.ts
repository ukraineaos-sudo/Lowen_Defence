/**
 * lib/content/content-migration-apply.ts — apply-safe оркестрація (injectable I/O)
 */
import type { SiteContent } from "@/src/types/content";
import {
  buildContentState,
  type ContentState,
} from "./content-state";
import {
  analyzeContentCompatibility,
  type CompatibilityResult,
  type MigrationChange,
} from "./content-migration";
import { CONTENT_CURRENT_PATH, CONTENT_RECOVERY_RAW_PREFIX } from "./paths";
import { validateSiteContent } from "./validate";

export type RawContentSnapshot = {
  raw: unknown;
  rawText: string;
  pathname: string;
  url?: string;
  uploadedAt?: Date;
};

export type ContentMigrationBlobPort = {
  readCurrentRaw: () => Promise<RawContentSnapshot | null>;
  putRawBackup: (pathname: string, body: string) => Promise<void>;
  putCurrent: (content: SiteContent) => Promise<void>;
  putState: (state: ContentState) => Promise<void>;
  readStateInitializedAt?: () => Promise<string | undefined>;
};

export type ApplySafeMigrationResult =
  | {
      status: "noop_valid";
      analysis: Extract<CompatibilityResult, { status: "valid" }>;
      snapshot: RawContentSnapshot;
    }
  | {
      status: "blocked";
      analysis: Extract<CompatibilityResult, { status: "blocked" }>;
      snapshot: RawContentSnapshot;
    }
  | {
      status: "dry_run_migratable";
      analysis: Extract<CompatibilityResult, { status: "migratable" }>;
      snapshot: RawContentSnapshot;
    }
  | {
      status: "applied";
      analysis: Extract<CompatibilityResult, { status: "migratable" }>;
      snapshot: RawContentSnapshot;
      backupPathname: string;
      content: SiteContent;
      changes: MigrationChange[];
    }
  | {
      status: "aborted_backup_failed";
      error: unknown;
      snapshot: RawContentSnapshot;
      backupPathname: string;
    }
  | {
      status: "aborted_verify_failed";
      error: string;
      snapshot: RawContentSnapshot;
      backupPathname: string;
    }
  | { status: "missing_current" };

function recoveryBackupPathname(now = new Date()): string {
  const stamp = now.toISOString().replace(/[:.]/g, "-");
  return `${CONTENT_RECOVERY_RAW_PREFIX}migration-${stamp}-site-content.json`;
}

/**
 * Dry-run або --apply-safe.
 * Запис current лише після успішного raw backup і лише для migratable.
 */
export async function runContentMigration(options: {
  port: ContentMigrationBlobPort;
  applySafe: boolean;
  now?: Date;
}): Promise<ApplySafeMigrationResult> {
  const snapshot = await options.port.readCurrentRaw();
  if (!snapshot) return { status: "missing_current" };

  const blobUploadedAt = snapshot.uploadedAt?.toISOString();
  const analysis = analyzeContentCompatibility(snapshot.raw, {
    blobUploadedAt,
  });

  if (analysis.status === "valid") {
    return { status: "noop_valid", analysis, snapshot };
  }

  if (analysis.status === "blocked") {
    return { status: "blocked", analysis, snapshot };
  }

  if (!options.applySafe) {
    return { status: "dry_run_migratable", analysis, snapshot };
  }

  const backupPathname = recoveryBackupPathname(options.now);
  try {
    await options.port.putRawBackup(backupPathname, snapshot.rawText);
  } catch (error) {
    return {
      status: "aborted_backup_failed",
      error,
      snapshot,
      backupPathname,
    };
  }

  const migrated = analysis.migrated;
  await options.port.putCurrent(migrated);

  const initializedAt = options.port.readStateInitializedAt
    ? await options.port.readStateInitializedAt()
    : undefined;
  await options.port.putState(
    buildContentState({
      initializedAt,
      lastContentUpdatedAt: migrated.updatedAt,
    })
  );

  const verify = await options.port.readCurrentRaw();
  if (!verify) {
    return {
      status: "aborted_verify_failed",
      error: "Current missing after write",
      snapshot,
      backupPathname,
    };
  }
  const recheck = validateSiteContent(verify.raw);
  if (!recheck.ok) {
    return {
      status: "aborted_verify_failed",
      error: recheck.error,
      snapshot,
      backupPathname,
    };
  }

  return {
    status: "applied",
    analysis,
    snapshot,
    backupPathname,
    content: recheck.content,
    changes: analysis.changes,
  };
}

export { CONTENT_CURRENT_PATH };
