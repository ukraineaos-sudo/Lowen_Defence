/**
 * lib/auth/password-store.ts — збережений хеш пароля адміна
 * Private Blob + локальний fallback; env — лише bootstrap при not_found.
 * unavailable ≠ not_found: при збої Blob не падаємо на старий env.
 */
import { list, put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { dataBlobToken, runtimeEnv } from "@/lib/env";

const HASH_PATH = "auth/admin-password-hash.txt";
const LOCAL_HASH = path.join(process.cwd(), "data", "admin-password-hash.txt");

export type PasswordReadResult =
  | { status: "found"; hash: string }
  | { status: "not_found" }
  | { status: "unavailable"; error?: unknown }
  | { status: "skipped" }; // немає Blob-токена

/** 1. Читання хешу з Blob з розрізненням not_found / unavailable. */
async function readHashFromBlob(): Promise<PasswordReadResult> {
  const token = dataBlobToken();
  if (!token) return { status: "skipped" };
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
    const text = (await res.text()).trim();
    if (!text) return { status: "not_found" };
    return { status: "found", hash: text };
  } catch (err) {
    console.warn("Password hash blob read failed:", err);
    return { status: "unavailable", error: err };
  }
}

function readHashFromLocal(): string | null {
  try {
    if (!fs.existsSync(LOCAL_HASH)) return null;
    const text = fs.readFileSync(LOCAL_HASH, "utf-8").trim();
    return text || null;
  } catch {
    return null;
  }
}

/**
 * 2. Активний хеш.
 * Blob configured + unavailable → null (fail closed, без env).
 * not_found / skipped → local → env bootstrap.
 */
export async function getActivePasswordHash(): Promise<string | null> {
  const fromBlob = await readHashFromBlob();
  if (fromBlob.status === "found") return fromBlob.hash;
  if (fromBlob.status === "unavailable") {
    console.error("Password store unavailable — fail closed (env bootstrap skipped)");
    return null;
  }

  const fromLocal = readHashFromLocal();
  if (fromLocal) return fromLocal;
  return runtimeEnv("ADMIN_PASSWORD_HASH") || null;
}

/** 3. Записати новий хеш (зміна пароля в адмінці). */
export async function writePasswordHash(
  hash: string
): Promise<{ success: boolean; error?: string }> {
  const trimmed = hash.trim();
  if (!trimmed.startsWith("scrypt:") && !trimmed.startsWith("pbkdf2:")) {
    return { success: false, error: "Некоректний формат хешу" };
  }

  const token = dataBlobToken();
  let blobOk = false;
  if (token) {
    try {
      await put(HASH_PATH, trimmed, {
        access: "private",
        token,
        addRandomSuffix: false,
        contentType: "text/plain",
        allowOverwrite: true,
      });
      blobOk = true;
    } catch (err) {
      console.error("Password hash blob write failed:", err);
    }
  }

  let localOk = false;
  try {
    fs.mkdirSync(path.dirname(LOCAL_HASH), { recursive: true });
    fs.writeFileSync(LOCAL_HASH, trimmed, "utf-8");
    localOk = true;
  } catch {
    /* serverless may be read-only */
  }

  // Якщо Data Blob налаштований — успіх лише після запису в Blob
  if (token) {
    if (!blobOk) {
      return {
        success: false,
        error: "Не вдалося зберегти пароль у Blob. Спробуйте пізніше.",
      };
    }
    return { success: true };
  }

  if (!localOk) {
    return { success: false, error: "Сховище ще не налаштовано" };
  }
  return { success: true };
}
