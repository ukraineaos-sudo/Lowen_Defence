/**
 * I18nProvider.tsx — клієнтський контекст локалі + словник для публічного сайту
 */
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { getDictionary, type Dictionary } from "./dictionary";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  htmlLang,
  type Locale,
} from "./locale";

type I18nContextValue = {
  locale: Locale;
  dict: Dictionary;
  /** Змінює локаль, cookie та document.documentElement.lang (без reload). */
  setLocale: (next: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

/** Записує cookie локалі на клієнті. */
function writeLocaleCookie(locale: Locale) {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

type I18nProviderProps = {
  initialLocale: Locale;
  children: React.ReactNode;
};

/** Провайдер i18n лише для публічного лендингу. */
export function I18nProvider({ initialLocale, children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(
    initialLocale || DEFAULT_LOCALE
  );

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeLocaleCookie(next);
    if (typeof document !== "undefined") {
      document.documentElement.lang = htmlLang(next);
    }
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dict: getDictionary(locale),
      setLocale,
    }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Хук словника/локалі публічного сайту. */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
