/**
 * lib/blob/media.ts — завантаження фото (public Media Blob)
 * JPEG/PNG/WebP ≤10MB; fallback у public/uploads/.
 */
import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { mediaBlobToken } from "@/lib/env";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 10 * 1024 * 1024;

function mediaToken(): string | undefined {
  return mediaBlobToken();
}

export function isMediaStoreConfigured(): boolean {
  return Boolean(mediaToken());
}

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "bin";
}

/** 1. Upload з data:URL → public URL (або /uploads/…). */
export async function uploadImageFromDataUrl(
  dataUrl: string,
  folder: string
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const matches = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!matches) {
    return { success: false, error: "Помилка декодування зображення" };
  }

  const mime = matches[1];
  if (!ALLOWED.has(mime) || mime.includes("svg")) {
    return { success: false, error: "Дозволені лише JPEG, PNG, WebP" };
  }

  const buffer = Buffer.from(matches[2], "base64");
  if (buffer.length > MAX_BYTES) {
    return { success: false, error: "Файл занадто великий (макс. 10 МБ)" };
  }

  const safeFolder = (folder || "general").replace(/[^a-zA-Z0-9_-]/g, "");
  const ext = extFromMime(mime);
  const safeName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  const pathname = `media/${safeFolder}/${safeName}`;

  const token = mediaToken();
  if (token) {
    try {
      const blob = await put(pathname, buffer, {
        access: "public",
        token,
        contentType: mime,
        addRandomSuffix: false,
      });
      return { success: true, url: blob.url };
    } catch (err) {
      console.error("Media blob upload failed:", err);
    }
  }

  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads", safeFolder);
    fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(path.join(uploadsDir, safeName), buffer);
    return { success: true, url: `/uploads/${safeFolder}/${safeName}` };
  } catch {
    return { success: false, error: "Сховище ще не налаштовано" };
  }
}
