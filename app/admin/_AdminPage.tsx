/**
 * _AdminPage.tsx — клієнтська сторінка адмінки (shell + login)
 */
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth/session";
import { readSiteContent } from "@/lib/content/store";
import { AdminShell, type AdminSection } from "@/src/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminSectionPage({
  section,
}: {
  section: AdminSection;
}) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/admin/login");

  const content = await readSiteContent();
  return (
    <AdminShell
      initialContent={content}
      username={session.u}
      section={section}
    />
  );
}
