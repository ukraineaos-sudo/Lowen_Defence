/**
 * lib/blob/detect-image-format.ts — magic bytes JPEG/PNG/WebP
 */
export type AllowedImageMime = "image/jpeg" | "image/png" | "image/webp";
export type ImageExtension = "jpg" | "png" | "webp";

export type DetectedImage =
  | {
      ok: true;
      mime: AllowedImageMime;
      extension: ImageExtension;
    }
  | {
      ok: false;
      code: "IMAGE_SIGNATURE_INVALID";
      error: string;
    };

/** Визначити формат за сигнатурою буфера (не за імʼям/MIME з клієнта). */
export function detectImageFormat(buffer: Buffer): DetectedImage {
  if (!buffer || buffer.length === 0) {
    return {
      ok: false,
      code: "IMAGE_SIGNATURE_INVALID",
      error: "Порожній файл зображення",
    };
  }

  // JPEG: FF D8 FF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ok: true, mime: "image/jpeg", extension: "jpg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { ok: true, mime: "image/png", extension: "png" };
  }

  // WebP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { ok: true, mime: "image/webp", extension: "webp" };
  }

  return {
    ok: false,
    code: "IMAGE_SIGNATURE_INVALID",
    error: "Файл не є JPEG, PNG або WebP",
  };
}
