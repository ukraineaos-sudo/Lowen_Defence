/**
 * page.tsx — головна: SSR контент + локаль → PublicSite
 */
import { readSiteContent } from "@/lib/content/store";
import { PublicSite } from "@/components/PublicSite";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [content, locale] = await Promise.all([
    readSiteContent(),
    getRequestLocale(),
  ]);
  return <PublicSite content={content} locale={locale} />;
}
