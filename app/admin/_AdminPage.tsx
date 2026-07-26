/**
 * _AdminPage.tsx — серверна сторінка адмінки (shell)
 */
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth/session";
import { readSiteContentForAdmin } from "@/lib/content/store";
import { AdminShell, type AdminSection } from "@/src/components/admin/AdminShell";
import { ContentMissingPanel } from "@/src/components/admin/ContentMissingPanel";

export const dynamic = "force-dynamic";

export default async function AdminSectionPage({
  section,
}: {
  section: AdminSection;
}) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/admin/login");

  const result = await readSiteContentForAdmin();
  if (!result.ok) {
    if (result.code === "CONTENT_MISSING") {
      return <ContentMissingPanel error={result.error} />;
    }
    return (
      <main className="min-h-screen bg-[#f8faf8] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-lg font-black text-[#082d20] mb-2">
            Сховище тимчасово недоступне
          </h1>
          <p className="text-sm text-[#64726a] mb-4">
            {result.error} Оновіть сторінку пізніше — збереження заблоковане, щоб не
            перезаписати актуальний контент дефолтом.
          </p>
          <a
            href="/admin"
            className="inline-flex items-center justify-center rounded-full bg-[#082d20] text-white text-sm font-bold px-4 py-2"
          >
            Спробувати знову
          </a>
        </div>
      </main>
    );
  }

  return (
    <AdminShell
      initialContent={result.content}
      initialRevision={result.revision}
      username={session.u}
      section={section}
    />
  );
}
