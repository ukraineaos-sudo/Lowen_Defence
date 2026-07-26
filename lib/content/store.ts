/**
 * lib/content/store.ts — контент сайту (JSON)
 * Public: Blob → local → default (graceful).
 * Admin/write при налаштованому Blob: тільки Blob; unavailable ≠ fallback.
 */
import { list, put, del } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { defaultSiteContent } from "@/src/data/default-site-content";
import type { ContentHistoryBackup, SiteContent } from "@/src/types/content";
import { validateSiteContent } from "./validate";
import { dataBlobToken } from "@/lib/env";

const CONTENT_PATH = "content/current/site-content.json";
const HISTORY_PREFIX = "content/history/";
const MAX_HISTORY = 20;

const LOCAL_DATA = path.join(process.cwd(), "data");
const LOCAL_CONTENT = path.join(LOCAL_DATA, "site-content.json");
const LOCAL_HISTORY = path.join(LOCAL_DATA, "history");

function dataToken(): string | undefined {
  return dataBlobToken();
}

export function isDataStoreConfigured(): boolean {
  return Boolean(dataToken());
}

export type ContentReadResult =
  | { status: "found"; content: SiteContent; source: "blob" | "local" | "default" }
  | { status: "unavailable"; error?: unknown }
  | { status: "not_found" };

/** 1. Читання current з Blob (found / not_found / unavailable). */
async function readFromBlob(): Promise<ContentReadResult> {
  const token = dataToken();
  if (!token) return { status: "not_found" };
  try {
    const { blobs } = await list({ prefix: CONTENT_PATH, token, limit: 1 });
    if (!blobs.length) return { status: "not_found" };
    const res = await fetch(blobs[0]!.url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return { status: "unavailable", error: `HTTP ${res.status}` };
    }
    const json = await res.json();
    const validated = validateSiteContent(json);
    if (!validated.ok) {
      // Пошкоджений JSON у Blob — не підміняти default для admin без явного fallback
      return { status: "unavailable", error: validated.error };
    }
    return { status: "found", content: validated.content, source: "blob" };
  } catch (err) {
    console.warn("Blob content read failed:", err);
    return { status: "unavailable", error: err };
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

/** Публічний сайт: graceful fallback Blob → local → default. */
export async function readSiteContent(): Promise<SiteContent> {
  const token = dataToken();
  if (token) {
    const fromBlob = await readFromBlob();
    if (fromBlob.status === "found") return fromBlob.content;
    // unavailable / not_found — публічка може показати local/default
    if (fromBlob.status === "unavailable") {
      console.warn("Blob unavailable for public read — using local/default fallback");
    }
  }
  const fromLocal = readFromLocal();
  if (fromLocal) return fromLocal;
  return defaultSiteContent;
}

/**
 * Адмінка: при налаштованому Data Blob не підсовувати default як «актуальний».
 * unavailable → помилка (заборона Save поверх фейкового контенту).
 */
export async function readSiteContentForAdmin(): Promise<
  | { ok: true; content: SiteContent; source: "blob" | "local" | "default" }
  | { ok: false; code: "STORAGE_UNAVAILABLE"; error: string }
> {
  const token = dataToken();
  if (token) {
    const fromBlob = await readFromBlob();
    if (fromBlob.status === "found") {
      return { ok: true, content: fromBlob.content, source: "blob" };
    }
    if (fromBlob.status === "unavailable") {
      return {
        ok: false,
        code: "STORAGE_UNAVAILABLE",
        error: "Сховище контенту тимчасово недоступне. Збереження заборонено.",
      };
    }
    // not_found у Blob — перший запуск: bootstrap default (але source позначений)
    return { ok: true, content: defaultSiteContent, source: "default" };
  }

  const fromLocal = readFromLocal();
  if (fromLocal) return { ok: true, content: fromLocal, source: "local" };
  return { ok: true, content: defaultSiteContent, source: "default" };
}

/** 2. Snapshot у history перед оновленням current (≤20 версій). */
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

/** 3. Зберегти контент. При Blob-токені — успіх лише після Blob write. */
export async function writeSiteContent(
  content: SiteContent
): Promise<{ success: boolean; error?: string; code?: string; content?: SiteContent }> {
  const validated = validateSiteContent(content);
  if (!validated.ok) return { success: false, error: validated.error, code: "VALIDATION" };

  const next: SiteContent = {
    ...validated.content,
    updatedAt: new Date().toISOString(),
  };

  const token = dataToken();
  if (token) {
    try {
      const previous = await readFromBlob();
      if (previous.status === "unavailable") {
        return {
          success: false,
          code: "STORAGE_UNAVAILABLE",
          error: "Сховище тимчасово недоступне. Збереження скасовано.",
        };
      }
      if (previous.status === "found") await writeHistoryBlob(previous.content, token);

      await put(CONTENT_PATH, JSON.stringify(next, null, 2), {
        access: "private",
        token,
        addRandomSuffix: false,
        contentType: "application/json",
        allowOverwrite: true,
      });
      return { success: true, content: next };
    } catch (err) {
      console.error("Blob content write failed:", err);
      return {
        success: false,
        code: "STORAGE_UNAVAILABLE",
        error: "Не вдалося записати контент у Blob.",
      };
    }
  }

  // Dev / без Blob: local only
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
    return { success: true, content: next };
  } catch {
    return { success: false, error: "Сховище ще не налаштовано", code: "STORAGE_MISSING" };
  }
}

/** 4. Список резервних копій для адмінки. */
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
      throw new Error("STORAGE_UNAVAILABLE");
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

/** 5. Відкат: взяти backup і записати як нову current. */
export async function rollbackContent(
  timestamp: string
): Promise<{ success: boolean; error?: string; code?: string; content?: SiteContent }> {
  try {
    const history = await listContentHistory();
    const match = history.find((h) => h.timestamp === timestamp);
    if (!match) return { success: false, error: "Версію не знайдено", code: "NOT_FOUND" };
    return writeSiteContent(match.content);
  } catch {
    return {
      success: false,
      code: "STORAGE_UNAVAILABLE",
      error: "Сховище тимчасово недоступне.",
    };
  }
}
