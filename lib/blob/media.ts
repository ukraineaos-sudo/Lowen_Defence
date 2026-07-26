/**
 * lib/blob/media.ts — декодування data:URL + оркестрація upload
 * JPEG/PNG/WebP за magic bytes; declared MIME має збігатися.
 * Запис — через storeMediaBuffer (fail-closed).
 */
import crypto from "crypto";
import {
  detectImageFormat,
  type AllowedImageMime,
} from "./detect-image-format";
import {
  storeMediaBuffer,
  type MediaStorageResult,
} from "./media-storage";

const ALLOWED = new Set<string>(["image/jpeg", "image/png", "image/webp"]);
/** Декодований розмір. base64+JSON ≈ ×4/3 → тримаємось нижче ліміту body 4.5 МБ. */
export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "3 МБ";

export type UploadImageResult =
  | { success: true; url: string; source: "blob" | "local" }
  | {
      success: false;
      code:
        | "IMAGE_INVALID"
        | "IMAGE_SIGNATURE_INVALID"
        | "IMAGE_MIME_MISMATCH"
        | "IMAGE_TOO_LARGE"
        | "MEDIA_STORAGE_MISSING"
        | "MEDIA_STORAGE_UNAVAILABLE"
        | "MEDIA_LOCAL_WRITE_FAILED";
      error: string;
    };

type DecodedImage = {
  success: true;
  mime: AllowedImageMime;
  buffer: Buffer;
};

type DecodeFail = Extract<UploadImageResult, { success: false }>;

/** Строгий base64: alphabet + padding; порожній після decode — відмова. */
export function decodeStrictBase64(raw: string): Buffer | null {
  const cleaned = raw.replace(/\s+/g, "");
  if (!cleaned) return null;
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(cleaned)) return null;
  const pad = cleaned.length % 4;
  const padded = pad === 0 ? cleaned : cleaned + "=".repeat(4 - pad);
  if (padded.length % 4 !== 0) return null;
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(padded)) return null;
  try {
    const buffer = Buffer.from(padded, "base64");
    if (buffer.length === 0) return null;
    return buffer;
  } catch {
    return null;
  }
}

/** 1. Розбір data:URL → mime + buffer (сигнатура обовʼязкова). */
export function decodeImageDataUrl(
  dataUrl: string
): DecodedImage | DecodeFail {
  const matches = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!matches) {
    return {
      success: false,
      code: "IMAGE_INVALID",
      error: "Помилка декодування зображення",
    };
  }

  const declaredMime = matches[1];
  if (!ALLOWED.has(declaredMime) || declaredMime.includes("svg")) {
    return {
      success: false,
      code: "IMAGE_INVALID",
      error: "Дозволені лише JPEG, PNG, WebP",
    };
  }

  const buffer = decodeStrictBase64(matches[2]);
  if (!buffer) {
    return {
      success: false,
      code: "IMAGE_INVALID",
      error: "Некоректний base64 зображення",
    };
  }

  if (buffer.length > MAX_UPLOAD_BYTES) {
    return {
      success: false,
      code: "IMAGE_TOO_LARGE",
      error: `Файл занадто великий (макс. ${MAX_UPLOAD_LABEL} через обмеження запиту)`,
    };
  }

  const detected = detectImageFormat(buffer);
  if (!detected.ok) {
    return {
      success: false,
      code: detected.code,
      error: detected.error,
    };
  }

  if (detected.mime !== declaredMime) {
    return {
      success: false,
      code: "IMAGE_MIME_MISMATCH",
      error: "MIME у data URL не збігається з фактичним форматом файлу",
    };
  }

  return { success: true, mime: detected.mime, buffer };
}

/** 2. Pathname: media/<folder>/<timestamp>-<rand>.<ext> */
export function createMediaPath(
  folder: string,
  mime: AllowedImageMime
): string {
  const safeFolder =
    (folder || "general").replace(/[^a-zA-Z0-9_-]/g, "") || "general";
  const ext = mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : "webp";
  const safeName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  return `media/${safeFolder}/${safeName}`;
}

/** 3. Upload з data:URL → public URL. */
export async function uploadImageFromDataUrl(
  dataUrl: string,
  folder: string
): Promise<UploadImageResult> {
  const decoded = decodeImageDataUrl(dataUrl);
  if (!decoded.success) return decoded;

  const stored: MediaStorageResult = await storeMediaBuffer({
    pathname: createMediaPath(folder, decoded.mime),
    buffer: decoded.buffer,
    contentType: decoded.mime,
  });
  return stored;
}
