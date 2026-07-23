/**
 * page.tsx — головна: SSR контент → PublicSite
 */
import { readSiteContent } from "@/lib/content/store";
import { PublicSite } from "@/components/PublicSite";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await readSiteContent();
  return <PublicSite content={content} />;
}
