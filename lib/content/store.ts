/**
 * lib/content/store.ts — контент сайту (JSON)
 * Public: Blob → local → default (graceful).
 * Admin: fail-closed + content state marker (не плутати first run і втрату current).
 */
import { list, put, del } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { defaultSiteContent } from "@/src/data/default-site-content";
import type { ContentHistoryBackup, SiteContent } from "@/src/types/content";
import { validateSiteContent, validateSiteContentInput } from "./validate";
import { dataBlobToken } from "@/lib/env";
import {
  CONTENT_STATE_PATH,
  buildContentState,
  parseContentState,
  resolveAdminBootstrapWhenCurrentMissing,
  type ContentState,
  type ContentStateReadResult,
  type HistoryInspectResult,
} from "./content-state";
import {
  CONTENT_CURRENT_PATH,
  CONTENT_HISTORY_PREFIX,
} from "./paths";

const CONTENT_PATH = CONTENT_CURRENT_PATH;
const HISTORY_PREFIX = CONTENT_HISTORY_PREFIX;
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

export type AdminContentReadResult =
  | { ok: true; content: SiteContent; source: "blob" | "local" | "default" }
  | {
      ok: false;
      code: "STORAGE_UNAVAILABLE" | "CONTENT_MISSING";
      error: string;
    };

/** 1. Читання current з Blob (found / not_found / unavailable). */
async function readFromBlob(): Promise<ContentReadResult> {
  const token = dataToken();
  if (!token) return { status: "not_found" };
  try {
    const { blobs } = await list({ prefix: CONTENT_PATH, token, limit: 20 });
    const match = blobs.find((b) => b.pathname === CONTENT_PATH);
    if (!match) return { status: "not_found" };
    const res = await fetch(match.url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return { status: "unavailable", error: `HTTP ${res.status}` };
    }
    const json = await res.json();
    const validated = validateSiteContent(json);
    if (!validated.ok) {
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

/** Marker: found / not_found / unavailable (пошкоджений JSON ≠ not_found). */
export async function readContentStateFromBlob(): Promise<ContentStateReadResult> {
  const token = dataToken();
  if (!token) return { status: "not_found" };
  try {
    const { blobs } = await list({ prefix: CONTENT_STATE_PATH, token, limit: 1 });
    const match = blobs.find((b) => b.pathname === CONTENT_STATE_PATH) || blobs[0];
    if (!match) return { status: "not_found" };
    const res = await fetch(match.url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return { status: "unavailable", error: `HTTP ${res.status}` };
    }
    let json: unknown;
    try {
      json = await res.json();
    } catch (err) {
      return { status: "unavailable", error: err };
    }
    return parseContentState(json);
  } catch (err) {
    console.warn("Content state blob read failed:", err);
    return { status: "unavailable", error: err };
  }
}

async function writeContentStateToBlob(
  state: ContentState
): Promise<{ ok: true } | { ok: false; error: unknown }> {
  const token = dataToken();
  if (!token) return { ok: false, error: "No data blob token" };
  try {
    await put(CONTENT_STATE_PATH, JSON.stringify(state, null, 2), {
      access: "private",
      token,
      addRandomSuffix: false,
      contentType: "application/json",
      allowOverwrite: true,
    });
    return { ok: true };
  } catch (err) {
    console.error("Content state blob write failed:", err);
    return { ok: false, error: err };
  }
}

/**
 * Legacy migration: якщо current є, а marker немає — створити.
 * Помилка запису не блокує admin-read (контент уже достовірний).
 */
export async function ensureContentStateMarker(
  lastContentUpdatedAt: string
): Promise<{ ensured: boolean; warning?: string }> {
  const existing = await readContentStateFromBlob();
  if (existing.status === "found") return { ensured: true };
  if (existing.status === "unavailable") {
    const msg = "Не вдалося перевірити content/state.json";
    console.error(msg, existing.error);
    return { ensured: false, warning: msg };
  }

  const state = buildContentState({ lastContentUpdatedAt });
  const written = await writeContentStateToBlob(state);
  if (!written.ok) {
    const msg = "Не вдалося створити content/state.json (legacy migration)";
    console.error(msg, written.error);
    return { ensured: false, warning: msg };
  }
  return { ensured: true };
}

/** Легкий probe history: list без скачування JSON. */
export async function inspectContentHistory(): Promise<HistoryInspectResult> {
  const token = dataToken();
  if (!token) return { status: "empty" };
  try {
    const { blobs } = await list({ prefix: HISTORY_PREFIX, token, limit: 1 });
    if (!blobs.length) return { status: "empty" };
    return { status: "exists", count: blobs.length };
  } catch (err) {
    console.warn("Blob history inspect failed:", err);
    return { status: "unavailable", error: err };
  }
}

/** Публічний сайт: graceful fallback Blob → local → default. */
export async function readSiteContent(): Promise<SiteContent> {
  const token = dataToken();
  if (token) {
    const fromBlob = await readFromBlob();
    if (fromBlob.status === "found") return fromBlob.content;
    if (fromBlob.status === "unavailable") {
      console.warn("Blob unavailable for public read — using local/default fallback");
    }
  }
  const fromLocal = readFromLocal();
  if (fromLocal) return fromLocal;
  return defaultSiteContent;
}

/**
 * Адмінка: fail-closed + marker×history матриця при current not_found.
 */
export async function readSiteContentForAdmin(): Promise<AdminContentReadResult> {
  const token = dataToken();
  if (token) {
    const fromBlob = await readFromBlob();
    if (fromBlob.status === "found") {
      const ensure = await ensureContentStateMarker(fromBlob.content.updatedAt);
      if (ensure.warning) {
        console.warn("ensureContentStateMarker:", ensure.warning);
      }
      return { ok: true, content: fromBlob.content, source: "blob" };
    }
    if (fromBlob.status === "unavailable") {
      return {
        ok: false,
        code: "STORAGE_UNAVAILABLE",
        error: "Сховище контенту тимчасово недоступне. Збереження заборонено.",
      };
    }

    // current not_found → marker і history СПІЛЬНО
    const [marker, history] = await Promise.all([
      readContentStateFromBlob(),
      inspectContentHistory(),
    ]);
    const decision = resolveAdminBootstrapWhenCurrentMissing(marker, history);
    if (!decision.ok) {
      return { ok: false, code: decision.code, error: decision.error };
    }
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

/** 3. Зберегти контент. При Blob-токені — current, потім marker. */
export async function writeSiteContent(
  content: unknown
): Promise<{
  success: boolean;
  error?: string;
  code?: string;
  fields?: { path: string; message: string }[];
  content?: SiteContent;
}> {
  const validated = validateSiteContentInput(content);
  if (!validated.ok) {
    return {
      success: false,
      error: validated.error,
      code: validated.code,
      fields: validated.fields,
    };
  }

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

      const existingState = await readContentStateFromBlob();
      const initializedAt =
        existingState.status === "found"
          ? existingState.state.initializedAt
          : undefined;
      const state = buildContentState({
        initializedAt,
        lastContentUpdatedAt: next.updatedAt,
      });
      const stateWrite = await writeContentStateToBlob(state);
      if (!stateWrite.ok) {
        // current уже записаний — не відкочуємо; окремий код
        return {
          success: true,
          content: next,
          code: "CONTENT_STATE_WRITE_FAILED",
          error:
            "Контент збережено, але не вдалося оновити state marker. Спробуйте зберегти ще раз.",
        };
      }

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

/** 5. Відкат: backup → нова current (+ marker через writeSiteContent). */
export async function rollbackContent(
  timestamp: string
): Promise<{ success: boolean; error?: string; code?: string; content?: SiteContent }> {
  try {
    const history = await listContentHistory();
    const match =
      timestamp === "latest"
        ? history[0]
        : history.find((h) => h.timestamp === timestamp);
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
