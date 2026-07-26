/**
 * scripts/audit-content-blob.ts — dry-run / --apply-safe для production current
 *
 * npm run audit:content
 * npm run migrate:content:safe
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { get, put, head, list } from "@vercel/blob";
import {
  runContentMigration,
  type ContentMigrationBlobPort,
  type RawContentSnapshot,
} from "../lib/content/content-migration-apply";
import { formatCompatibilityReport } from "../lib/content/content-migration";
import { CONTENT_CURRENT_PATH } from "../lib/content/paths";
import { CONTENT_STATE_PATH, parseContentState } from "../lib/content/content-state";
import { dataBlobToken } from "../lib/env";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function streamToText(stream: ReadableStream<Uint8Array>): Promise<string> {
  return new Response(stream).text();
}

async function readCurrentExact(token: string): Promise<RawContentSnapshot | null> {
  // Exact pathname via get(); fallback list+pathname filter for older stores.
  const viaGet = await get(CONTENT_CURRENT_PATH, {
    access: "private",
    token,
  });
  if (viaGet && viaGet.statusCode === 200) {
    const rawText = await streamToText(viaGet.stream);
    const raw = JSON.parse(rawText) as unknown;
    return {
      raw,
      rawText,
      pathname: viaGet.blob.pathname || CONTENT_CURRENT_PATH,
      url: viaGet.blob.url,
      uploadedAt: viaGet.blob.uploadedAt,
    };
  }

  const { blobs } = await list({ prefix: CONTENT_CURRENT_PATH, token, limit: 20 });
  const match = blobs.find((b) => b.pathname === CONTENT_CURRENT_PATH);
  if (!match) return null;

  const res = await fetch(match.url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to download current: HTTP ${res.status}`);
  }
  const rawText = await res.text();
  const raw = JSON.parse(rawText) as unknown;

  let uploadedAt = match.uploadedAt;
  try {
    const meta = await head(CONTENT_CURRENT_PATH, { token });
    uploadedAt = meta.uploadedAt;
  } catch {
    /* keep list uploadedAt */
  }

  return {
    raw,
    rawText,
    pathname: match.pathname,
    url: match.url,
    uploadedAt,
  };
}

function createBlobPort(token: string): ContentMigrationBlobPort {
  return {
    async readCurrentRaw() {
      return readCurrentExact(token);
    },
    async putRawBackup(pathname, body) {
      await put(pathname, body, {
        access: "private",
        token,
        addRandomSuffix: false,
        contentType: "application/json",
        allowOverwrite: true,
      });
    },
    async putCurrent(content) {
      await put(CONTENT_CURRENT_PATH, JSON.stringify(content, null, 2), {
        access: "private",
        token,
        addRandomSuffix: false,
        contentType: "application/json",
        allowOverwrite: true,
      });
    },
    async putState(state) {
      await put(CONTENT_STATE_PATH, JSON.stringify(state, null, 2), {
        access: "private",
        token,
        addRandomSuffix: false,
        contentType: "application/json",
        allowOverwrite: true,
      });
    },
    async readStateInitializedAt() {
      try {
        const result = await get(CONTENT_STATE_PATH, {
          access: "private",
          token,
        });
        if (!result || result.statusCode !== 200) return undefined;
        const json = JSON.parse(await streamToText(result.stream)) as unknown;
        const parsed = parseContentState(json);
        return parsed.status === "found" ? parsed.state.initializedAt : undefined;
      } catch {
        return undefined;
      }
    },
  };
}

async function main() {
  loadEnvLocal();
  const applySafe = process.argv.includes("--apply-safe");
  const token = dataBlobToken();
  if (!token) {
    console.error(
      "DATA_BLOB_READ_WRITE_TOKEN is missing. Set it in .env.local or the environment."
    );
    process.exit(1);
  }

  console.log(applySafe ? "Mode: --apply-safe" : "Mode: dry-run (no writes)");
  console.log(`Target: ${CONTENT_CURRENT_PATH}`);

  const result = await runContentMigration({
    port: createBlobPort(token),
    applySafe,
  });

  if (result.status === "missing_current") {
    console.error("BLOCKED\nCurrent object not found at exact pathname.");
    process.exit(2);
  }

  if (
    result.status === "noop_valid" ||
    result.status === "blocked" ||
    result.status === "dry_run_migratable" ||
    result.status === "applied"
  ) {
    console.log(
      formatCompatibilityReport(result.analysis, {
        pathname: result.snapshot.pathname,
        url: result.snapshot.url,
      })
    );
  }

  if (result.status === "noop_valid") {
    process.exit(0);
  }

  if (result.status === "blocked") {
    process.exit(3);
  }

  if (result.status === "dry_run_migratable") {
    process.exit(0);
  }

  if (result.status === "aborted_backup_failed") {
    console.error("\nABORT: raw backup failed — current was NOT modified.");
    console.error(result.error);
    process.exit(4);
  }

  if (result.status === "aborted_verify_failed") {
    console.error("\nABORT after write: re-validation failed.");
    console.error(result.error);
    console.error(`Raw backup pathname: ${result.backupPathname}`);
    process.exit(5);
  }

  if (result.status === "applied") {
    console.log("\nAPPLIED");
    console.log(`Raw backup: ${result.backupPathname}`);
    console.log(`updatedAt: ${result.content.updatedAt}`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
