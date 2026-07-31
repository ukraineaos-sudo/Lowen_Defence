/**
 * get-request-locale.ts — серверне читання локалі з cookie (App Router)
 */
import { cookies } from "next/headers";
import {
  LOCALE_COOKIE,
  localeFromCookie,
  type Locale,
} from "./locale";

/** Локаль поточного запиту з cookie `ld_locale`. */
export async function getRequestLocale(): Promise<Locale> {
  const jar = await cookies();
  return localeFromCookie(jar.get(LOCALE_COOKIE)?.value);
}
