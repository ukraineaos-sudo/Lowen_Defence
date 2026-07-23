import { list, put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { dataBlobToken, runtimeEnv } from "@/lib/env";

const HASH_PATH = "auth/admin-password-hash.txt";
const LOCAL_HASH = path.join(process.cwd(), "data", "admin-password-hash.txt");

async function readHashFromBlob(): Promise<string | null> {
  const token = dataBlobToken();
  if (!token) return null;
  try {
    const { blobs } = await list({ prefix: HASH_PATH, token, limit: 1 });
    const match = blobs.find((b) => b.pathname === HASH_PATH) || blobs[0];
    if (!match) return null;
    const res = await fetch(match.url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const text = (await res.text()).trim();
    return text || null;
  } catch (err) {
    console.warn("Password hash blob read failed:", err);
    return null;
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
 * Active password hash: stored override (Blob/local) → env bootstrap.
 */
export async function getActivePasswordHash(): Promise<string | null> {
  const fromBlob = await readHashFromBlob();
  if (fromBlob) return fromBlob;
  const fromLocal = readHashFromLocal();
  if (fromLocal) return fromLocal;
  return runtimeEnv("ADMIN_PASSWORD_HASH") || null;
}

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

  if (!blobOk && !localOk) {
    return { success: false, error: "Сховище ще не налаштовано" };
  }
  return { success: true };
}
