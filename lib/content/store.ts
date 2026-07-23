import { list, put, del } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { defaultSiteContent } from "@/src/data/default-site-content";
import type { ContentHistoryBackup, SiteContent } from "@/src/types/content";
import { validateSiteContent } from "./validate";
import { runtimeEnv } from "@/lib/env";

const CONTENT_PATH = "content/current/site-content.json";
const HISTORY_PREFIX = "content/history/";
const MAX_HISTORY = 20;

const LOCAL_DATA = path.join(process.cwd(), "data");
const LOCAL_CONTENT = path.join(LOCAL_DATA, "site-content.json");
const LOCAL_HISTORY = path.join(LOCAL_DATA, "history");

function dataToken(): string | undefined {
  return runtimeEnv("DATA_BLOB_READ_WRITE_TOKEN");
}

export function isDataStoreConfigured(): boolean {
  return Boolean(dataToken());
}

async function readFromBlob(): Promise<SiteContent | null> {
  const token = dataToken();
  if (!token) return null;
  try {
    const { blobs } = await list({ prefix: CONTENT_PATH, token, limit: 1 });
    if (!blobs.length) return null;
    const res = await fetch(blobs[0].url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const validated = validateSiteContent(json);
    return validated.ok ? validated.content : null;
  } catch (err) {
    console.warn("Blob content read failed:", err);
    return null;
  }
}

function readFromLocal(): SiteContent | null {
  try {
    if (!fs.existsSync(LOCAL_CONTENT)) return null;
    const raw = fs.readFileSync(LOCAL_CONTENT, "utf-8");
    const validated = validateSiteContent(JSON.parse(raw));
    return validated.ok ? validated.content : null;
  } catch {
    return null;
  }
}

export async function readSiteContent(): Promise<SiteContent> {
  const fromBlob = await readFromBlob();
  if (fromBlob) return fromBlob;
  const fromLocal = readFromLocal();
  if (fromLocal) return fromLocal;
  return defaultSiteContent;
}

async function writeHistoryBlob(content: SiteContent, token: string) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const pathname = `${HISTORY_PREFIX}${stamp}-site-content.json`;
  await put(pathname, JSON.stringify(content, null, 2), {
    access: "private",
    token,
    addRandomSuffix: false,
    contentType: "application/json",
    allowOverwrite: true,
  });

  try {
    const { blobs } = await list({ prefix: HISTORY_PREFIX, token });
    const sorted = [...blobs].sort((a, b) =>
      (b.uploadedAt?.toString() || "").localeCompare(a.uploadedAt?.toString() || "")
    );
    for (const old of sorted.slice(MAX_HISTORY)) {
      try {
        await del(old.url, { token });
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* ignore prune errors */
  }
}

function writeHistoryLocal(content: SiteContent) {
  if (!fs.existsSync(LOCAL_HISTORY)) {
    fs.mkdirSync(LOCAL_HISTORY, { recursive: true });
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  fs.writeFileSync(
    path.join(LOCAL_HISTORY, `${stamp}-site-content.json`),
    JSON.stringify(content, null, 2),
    "utf-8"
  );
  const files = fs
    .readdirSync(LOCAL_HISTORY)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse();
  for (const f of files.slice(MAX_HISTORY)) {
    try {
      fs.unlinkSync(path.join(LOCAL_HISTORY, f));
    } catch {
      /* ignore */
    }
  }
}

export async function writeSiteContent(
  content: SiteContent
): Promise<{ success: boolean; error?: string; content?: SiteContent }> {
  const validated = validateSiteContent(content);
  if (!validated.ok) return { success: false, error: validated.error };

  const next: SiteContent = {
    ...validated.content,
    updatedAt: new Date().toISOString(),
  };

  const token = dataToken();
  let blobOk = false;
  if (token) {
    try {
      // snapshot previous if exists
      const previous = await readFromBlob();
      if (previous) await writeHistoryBlob(previous, token);

      await put(CONTENT_PATH, JSON.stringify(next, null, 2), {
        access: "private",
        token,
        addRandomSuffix: false,
        contentType: "application/json",
        allowOverwrite: true,
      });
      blobOk = true;
    } catch (err) {
      console.error("Blob content write failed:", err);
    }
  }

  let localOk = false;
  try {
    if (!fs.existsSync(LOCAL_DATA)) fs.mkdirSync(LOCAL_DATA, { recursive: true });
    if (fs.existsSync(LOCAL_CONTENT)) {
      try {
        const prev = JSON.parse(fs.readFileSync(LOCAL_CONTENT, "utf-8"));
        writeHistoryLocal(prev);
      } catch {
        /* ignore */
      }
    }
    fs.writeFileSync(LOCAL_CONTENT, JSON.stringify(next, null, 2), "utf-8");
    localOk = true;
  } catch {
    /* serverless may be read-only */
  }

  if (!blobOk && !localOk) {
    return { success: false, error: "Сховище ще не налаштовано" };
  }

  return { success: true, content: next };
}

export async function listContentHistory(): Promise<ContentHistoryBackup[]> {
  const token = dataToken();
  const backups: ContentHistoryBackup[] = [];

  if (token) {
    try {
      const { blobs } = await list({ prefix: HISTORY_PREFIX, token });
      const sorted = [...blobs].sort((a, b) =>
        (b.pathname || "").localeCompare(a.pathname || "")
      );
      for (const blob of sorted.slice(0, MAX_HISTORY)) {
        try {
          const res = await fetch(blob.url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) continue;
          const parsed = (await res.json()) as SiteContent;
          const timestamp = (blob.pathname || "")
            .replace(HISTORY_PREFIX, "")
            .replace("-site-content.json", "");
          backups.push({
            timestamp,
            updatedAt: parsed.updatedAt || timestamp,
            coursesCount: parsed.courses?.length || 0,
            teamCount: parsed.team?.length || 0,
            content: parsed,
          });
        } catch {
          /* skip */
        }
      }
      if (backups.length) return backups;
    } catch (err) {
      console.warn("Blob history list failed:", err);
    }
  }

  try {
    if (fs.existsSync(LOCAL_HISTORY)) {
      const files = fs
        .readdirSync(LOCAL_HISTORY)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .reverse();
      for (const file of files.slice(0, MAX_HISTORY)) {
        try {
          const parsed = JSON.parse(
            fs.readFileSync(path.join(LOCAL_HISTORY, file), "utf-8")
          ) as SiteContent;
          const timestamp = file.replace("-site-content.json", "");
          backups.push({
            timestamp,
            updatedAt: parsed.updatedAt || timestamp,
            coursesCount: parsed.courses?.length || 0,
            teamCount: parsed.team?.length || 0,
            content: parsed,
          });
        } catch {
          /* skip */
        }
      }
    }
  } catch {
    /* ignore */
  }

  return backups;
}

export async function rollbackContent(
  timestamp: string
): Promise<{ success: boolean; error?: string; content?: SiteContent }> {
  const history = await listContentHistory();
  const match = history.find((h) => h.timestamp === timestamp);
  if (!match) return { success: false, error: "Версію не знайдено" };
  return writeSiteContent(match.content);
}
