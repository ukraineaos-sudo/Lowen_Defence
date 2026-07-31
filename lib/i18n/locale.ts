/**
 * locale.ts — локалі публічного сайту (uk | en)
 *
 * Стратегія: cookie `ld_locale` (+ опційно `?lang=uk|en` для форсу через middleware).
 * URL-префікс `/en` не використовуємо — адмінка й публічний `/` лишаються без locale-сегмента.
 * `html lang` виставляється в root layout з cookie; клієнтський toggle оновлює cookie + lang.
 */
export const LOCALES = ["uk", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "uk";

/** Cookie з вибором мови публічного сайту (не стосується admin UI). */
export const LOCALE_COOKIE = "ld_locale";

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Повертає валідну локаль або null. */
export function parseLocale(value: string | null | undefined): Locale | null {
  if (value === "uk" || value === "en") return value;
  return null;
}

/** Cookie → локаль з fallback на uk. */
export function localeFromCookie(value: string | null | undefined): Locale {
  return parseLocale(value) ?? DEFAULT_LOCALE;
}

/** Атрибут lang для <html>. */
export function htmlLang(locale: Locale): string {
  return locale;
}
