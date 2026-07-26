/**
 * lib/auth/password-store.ts — хеш пароля адміна + durable password-state marker
 * Data Blob: hash×marker policy; local лише без Blob (dev).
 */
import { list, put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { dataBlobToken, runtimeEnv } from "@/lib/env";
import {
  PASSWORD_STATE_PATH,
  buildPasswordState,
  isSupportedPasswordHash,
  parsePasswordState,
  resolvePasswordBootstrap,
  type PasswordHashProbe,
  type PasswordState,
  type PasswordStateProbe,
} from "./password-state";

const HASH_PATH = "auth/admin-password-hash.txt";
const LOCAL_HASH = path.join(process.cwd(), "data", "admin-password-hash.txt");

export type ActivePasswordResult =
  | {
      ok: true;
      hash: string;
      source: "blob" | "local" | "env";
      warning?: string;
    }
  | {
      ok: false;
      code:
        | "PASSWORD_HASH_MISSING"
        | "PASSWORD_HASH_CORRUPTED"
        | "PASSWORD_STORE_UNAVAILABLE"
        | "PASSWORD_NOT_CONFIGURED";
      error: string;
    };

function classifyHashText(text: string): PasswordHashProbe {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      status: "corrupted",
      error: "Password hash object is empty",
    };
  }
  if (!isSupportedPasswordHash(trimmed)) {
    return {
      status: "corrupted",
      error: "Unsupported password hash format",
    };
  }
  return { status: "found", hash: trimmed };
}

/** 1. Читання хешу з Blob. */
async function readHashFromBlob(): Promise<PasswordHashProbe> {
  const token = dataBlobToken();
  if (!token) return { status: "not_found" };
  try {
    const { blobs } = await list({ prefix: HASH_PATH, token, limit: 1 });
    const match = blobs.find((b) => b.pathname === HASH_PATH) || blobs[0];
    if (!match) return { status: "not_found" };
    const res = await fetch(match.url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return { status: "unavailable", error: `HTTP ${res.status}` };
    }
    const text = await res.text();
    return classifyHashText(text);
  } catch (err) {
    console.warn("Password hash blob read failed:", err);
    return { status: "unavailable", error: err };
  }
}

async function readPasswordStateFromBlob(): Promise<PasswordStateProbe> {
  const token = dataBlobToken();
  if (!token) return { status: "not_found" };
  try {
    const { blobs } = await list({ prefix: PASSWORD_STATE_PATH, token, limit: 1 });
    const match =
      blobs.find((b) => b.pathname === PASSWORD_STATE_PATH) || blobs[0];
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
      return { status: "corrupted", error: err };
    }
    return parsePasswordState(json);
  } catch (err) {
    console.warn("Password state blob read failed:", err);
    return { status: "unavailable", error: err };
  }
}

async function writePasswordStateToBlob(
  state: PasswordState
): Promise<{ ok: true } | { ok: false; error: unknown }> {
  const token = dataBlobToken();
  if (!token) return { ok: false, error: "No data blob token" };
  try {
    await put(PASSWORD_STATE_PATH, JSON.stringify(state, null, 2), {
      access: "private",
      token,
      addRandomSuffix: false,
      contentType: "application/json",
      allowOverwrite: true,
    });
    return { ok: true };
  } catch (err) {
    console.error("Password state blob write failed:", err);
    return { ok: false, error: err };
  }
}

/** Legacy: hash є, marker немає → створити (не блокує вхід). */
export async function ensurePasswordStateMarker(): Promise<{
  ok: boolean;
  code?: string;
  error?: unknown;
}> {
  const existing = await readPasswordStateFromBlob();
  if (existing.status === "found") return { ok: true };
  if (existing.status === "unavailable" || existing.status === "corrupted") {
    return {
      ok: false,
      code: "PASSWORD_STORE_UNAVAILABLE",
      error: existing.error,
    };
  }

  const now = new Date().toISOString();
  const state = buildPasswordState({ lastChangedAt: now, now });
  const written = await writePasswordStateToBlob(state);
  if (!written.ok) {
    return {
      ok: false,
      code: "PASSWORD_STATE_WRITE_FAILED",
      error: written.error,
    };
  }
  return { ok: true };
}

function readHashFromLocal(): PasswordHashProbe {
  try {
    if (!fs.existsSync(LOCAL_HASH)) return { status: "not_found" };
    const text = fs.readFileSync(LOCAL_HASH, "utf-8");
    return classifyHashText(text);
  } catch (err) {
    return { status: "unavailable", error: err };
  }
}

function blockedMessage(
  code: Exclude<ActivePasswordResult & { ok: false }, never>["code"]
): string {
  switch (code) {
    case "PASSWORD_HASH_MISSING":
      return "Файл пароля відсутній після ініціалізації сховища.";
    case "PASSWORD_HASH_CORRUPTED":
      return "Файл пароля пошкоджений або має некоректний формат.";
    case "PASSWORD_STORE_UNAVAILABLE":
      return "Сховище пароля тимчасово недоступне.";
    case "PASSWORD_NOT_CONFIGURED":
      return "Пароль адміна не налаштовано.";
    default:
      return "Вхід тимчасово недоступний.";
  }
}

/**
 * 2. Активний хеш з розрізненням причин блокування.
 * Data Blob налаштований → local ігнорується.
 */
export async function getActivePasswordResult(): Promise<ActivePasswordResult> {
  const token = dataBlobToken();

  if (token) {
    const [hashProbe, stateProbe] = await Promise.all([
      readHashFromBlob(),
      readPasswordStateFromBlob(),
    ]);
    const decision = resolvePasswordBootstrap(hashProbe, stateProbe);

    if (decision.status === "use_hash") {
      const ensure = await ensurePasswordStateMarker();
      if (!ensure.ok) {
        console.error("Password state marker ensure failed", {
          code: ensure.code,
          error: ensure.error,
        });
        return {
          ok: true,
          hash: decision.hash,
          source: "blob",
          warning: ensure.code || "PASSWORD_STATE_WRITE_FAILED",
        };
      }
      return { ok: true, hash: decision.hash, source: "blob" };
    }

    if (decision.status === "blocked") {
      console.error("Password store blocked", { code: decision.code });
      return {
        ok: false,
        code: decision.code,
        error: blockedMessage(decision.code),
      };
    }

    // bootstrap: env only (local ignored when Blob configured)
    const envHash = runtimeEnv("ADMIN_PASSWORD_HASH");
    if (envHash && isSupportedPasswordHash(envHash.trim())) {
      return { ok: true, hash: envHash.trim(), source: "env" };
    }
    return {
      ok: false,
      code: "PASSWORD_NOT_CONFIGURED",
      error: blockedMessage("PASSWORD_NOT_CONFIGURED"),
    };
  }

  // Dev: local → env
  const local = readHashFromLocal();
  if (local.status === "found") {
    return { ok: true, hash: local.hash, source: "local" };
  }
  if (local.status === "corrupted" || local.status === "unavailable") {
    return {
      ok: false,
      code:
        local.status === "corrupted"
          ? "PASSWORD_HASH_CORRUPTED"
          : "PASSWORD_STORE_UNAVAILABLE",
      error: blockedMessage(
        local.status === "corrupted"
          ? "PASSWORD_HASH_CORRUPTED"
          : "PASSWORD_STORE_UNAVAILABLE"
      ),
    };
  }

  const envHash = runtimeEnv("ADMIN_PASSWORD_HASH");
  if (envHash && isSupportedPasswordHash(envHash.trim())) {
    return { ok: true, hash: envHash.trim(), source: "env" };
  }
  return {
    ok: false,
    code: "PASSWORD_NOT_CONFIGURED",
    error: blockedMessage("PASSWORD_NOT_CONFIGURED"),
  };
}

/** Зворотна сумісність: hash або null. */
export async function getActivePasswordHash(): Promise<string | null> {
  const result = await getActivePasswordResult();
  return result.ok ? result.hash : null;
}

/** 3. Записати новий хеш (+ marker). */
export async function writePasswordHash(
  hash: string
): Promise<{ success: boolean; error?: string; code?: string; warning?: string }> {
  const trimmed = hash.trim();
  if (!isSupportedPasswordHash(trimmed)) {
    return { success: false, error: "Некоректний формат хешу", code: "VALIDATION" };
  }

  const token = dataBlobToken();
  const now = new Date().toISOString();

  if (token) {
    try {
      await put(HASH_PATH, trimmed, {
        access: "private",
        token,
        addRandomSuffix: false,
        contentType: "text/plain",
        allowOverwrite: true,
      });
    } catch (err) {
      console.error("Password hash blob write failed:", err);
      return {
        success: false,
        error: "Не вдалося зберегти пароль у Blob. Спробуйте пізніше.",
        code: "PASSWORD_STORE_UNAVAILABLE",
      };
    }

    const existing = await readPasswordStateFromBlob();
    const initializedAt =
      existing.status === "found" ? existing.state.initializedAt : undefined;
    const state = buildPasswordState({
      initializedAt,
      lastChangedAt: now,
      now,
    });
    const stateWrite = await writePasswordStateToBlob(state);
    if (!stateWrite.ok) {
      return {
        success: true,
        warning: "PASSWORD_STATE_WRITE_FAILED",
        code: "PASSWORD_STATE_WRITE_FAILED",
        error:
          "Пароль змінено, але не вдалося оновити state marker. Спробуйте ще раз пізніше.",
      };
    }
    return { success: true };
  }

  // Dev local
  try {
    fs.mkdirSync(path.dirname(LOCAL_HASH), { recursive: true });
    fs.writeFileSync(LOCAL_HASH, trimmed, "utf-8");
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Сховище ще не налаштовано",
      code: "PASSWORD_NOT_CONFIGURED",
    };
  }
}
