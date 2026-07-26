/**
 * lib/blob/media-storage.ts — запис медіа (fail-closed)
 * Blob token є → лише Blob; помилка Blob НЕ маскується локальним записом.
 * Local (public/uploads/) — лише dev без токена.
 */
import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { mediaBlobToken } from "@/lib/env";
import type { AllowedImageMime } from "./detect-image-format";

export type { AllowedImageMime };

export type MediaStorageResult =
  | {
      success: true;
      url: string;
      source: "blob" | "local";
    }
  | {
      success: false;
      code:
        | "MEDIA_STORAGE_MISSING"
        | "MEDIA_STORAGE_UNAVAILABLE"
        | "MEDIA_LOCAL_WRITE_FAILED";
      error: string;
    };

function writeMediaLocally(
  pathname: string,
  buffer: Buffer
): MediaStorageResult {
  try {
    const rel = pathname.replace(/^media\//, "");
    const target = path.join(process.cwd(), "public", "uploads", rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, buffer);
    return { success: true, url: `/uploads/${rel}`, source: "local" };
  } catch (error) {
    console.error("Media local write failed", { pathname, error });
    return {
      success: false,
      code: "MEDIA_LOCAL_WRITE_FAILED",
      error: "Не вдалося зберегти файл локально.",
    };
  }
}

/**
 * Записати буфер зображення у вибраний backend.
 * token є + put упав = MEDIA_STORAGE_UNAVAILABLE (без local fallback).
 */
export async function storeMediaBuffer({
  pathname,
  buffer,
  contentType,
}: {
  pathname: string;
  buffer: Buffer;
  contentType: AllowedImageMime;
}): Promise<MediaStorageResult> {
  const token = mediaBlobToken();

  if (token) {
    try {
      const blob = await put(pathname, buffer, {
        access: "public",
        token,
        contentType,
        addRandomSuffix: false,
      });
      return { success: true, url: blob.url, source: "blob" };
    } catch (error) {
      console.error("Media Blob write failed", { pathname, error });
      return {
        success: false,
        code: "MEDIA_STORAGE_UNAVAILABLE",
        error:
          "Сховище зображень тимчасово недоступне. Старе фото залишилося без змін.",
      };
    }
  }

  if (process.env.NODE_ENV === "production") {
    return {
      success: false,
      code: "MEDIA_STORAGE_MISSING",
      error: "Media Blob не налаштовано.",
    };
  }

  return writeMediaLocally(pathname, buffer);
}
