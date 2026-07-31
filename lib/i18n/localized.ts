/**
 * localized.ts — dual-shape CMS-рядки: string (uk) | { uk, en? }
 * Старий Blob JSON без en лишається валідним; resolve падає назад на uk.
 */
import type { Locale } from "./locale";

export type LocalizedText = string | { uk: string; en?: string };

/** Чи схоже значення на LocalizedText. */
export function isLocalizedText(value: unknown): value is LocalizedText {
  if (typeof value === "string") return true;
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.uk === "string";
}

/** Український (канонічний) текст для адмінки / fallback. */
export function localizedUk(value: LocalizedText): string {
  return typeof value === "string" ? value : value.uk;
}

/**
 * Оновлює uk, зберігаючи en якщо він був у dual-shape.
 * Без en зберігає plain string (компактний JSON, сумісність).
 */
export function withLocalizedUk(
  prev: LocalizedText | undefined,
  uk: string
): LocalizedText {
  if (prev && typeof prev === "object" && typeof prev.en === "string" && prev.en.trim()) {
    return { uk, en: prev.en };
  }
  return uk;
}

/** Текст для поточної локалі з fallback на uk. */
export function resolveLocalized(
  value: LocalizedText,
  locale: Locale
): string {
  if (typeof value === "string") return value;
  if (locale === "en" && value.en?.trim()) return value.en;
  return value.uk;
}

/** Масив LocalizedText → рядки для локалі. */
export function resolveLocalizedList(
  values: LocalizedText[],
  locale: Locale
): string[] {
  return values.map((v) => resolveLocalized(v, locale));
}
