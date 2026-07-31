/**
 * LanguageToggle.tsx — перемикач UA|EN у шапці/підвалі
 */
"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/locale";

type LanguageToggleProps = {
  /** Компактний варіант для футера (світліший на темному тлі). */
  variant?: "header" | "footer";
};

/** Кнопки UA|EN: зберігають cookie й оновлюють lang без перезавантаження. */
export function LanguageToggle({ variant = "header" }: LanguageToggleProps) {
  const { locale, setLocale, dict } = useI18n();

  const select = (next: Locale) => {
    if (next === locale) return;
    setLocale(next);
  };

  return (
    <div
      className={`lang-toggle lang-toggle--${variant}`}
      role="group"
      aria-label={dict.lang.switchLabel}
    >
      <button
        type="button"
        className={locale === "uk" ? "is-active" : undefined}
        aria-pressed={locale === "uk"}
        onClick={() => select("uk")}
      >
        {dict.lang.uk}
      </button>
      <button
        type="button"
        className={locale === "en" ? "is-active" : undefined}
        aria-pressed={locale === "en"}
        onClick={() => select("en")}
      >
        {dict.lang.en}
      </button>
    </div>
  );
}
