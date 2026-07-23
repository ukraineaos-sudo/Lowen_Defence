"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteContent } from "../../types/content";
import { CourseApplication, ApplicationStatus } from "../../types/application";
import { CoursesEditor } from "./CoursesEditor";
import { TeamEditor } from "./TeamEditor";
import { ContactsEditor } from "./ContactsEditor";
import { ApplicationsManager } from "./ApplicationsManager";
import { HistoryManager } from "./HistoryManager";
import { DeviceFramePreview } from "./DeviceFramePreview";
import { PublicSite } from "@/components/PublicSite";
import {
  Shield,
  Save,
  RotateCcw,
  LogOut,
  Eye,
  Inbox,
  BookOpen,
  Users,
  PhoneCall,
  History as HistoryIcon,
  Check,
  AlertCircle,
  Loader2,
  Monitor,
  LayoutDashboard,
} from "lucide-react";

export type AdminSection =
  | "dashboard"
  | "applications"
  | "courses"
  | "team"
  | "contacts"
  | "preview"
  | "history";

interface AdminShellProps {
  initialContent: SiteContent;
  username: string;
  section: AdminSection;
}

const fetchOpts: RequestInit = { credentials: "include" };

export const AdminShell: React.FC<AdminShellProps> = ({
  initialContent,
  username,
  section,
}) => {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [savedContent, setSavedContent] = useState<SiteContent>(initialContent);
  const [applications, setApplications] = useState<CourseApplication[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [storageConfigured, setStorageConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    setHasUnsavedChanges(
      JSON.stringify(content) !== JSON.stringify(savedContent)
    );
  }, [content, savedContent]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    fetch("/api/auth/session", fetchOpts)
      .then((res) => res.json())
      .then((data) => {
        if (data.storageConfigured !== undefined) {
          setStorageConfigured(data.storageConfigured);
        }
      })
      .catch(() => {});
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/admin/applications", fetchOpts);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || data);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  useEffect(() => {
    fetchApplications();
    const interval = setInterval(fetchApplications, 30000);
    return () => clearInterval(interval);
  }, []);

  const navigate = (next: AdminSection) => {
    if (hasUnsavedChanges && !confirm("Є незбережені зміни. Перейти без збереження?")) {
      return;
    }
    const map: Record<AdminSection, string> = {
      dashboard: "/admin",
      applications: "/admin/applications",
      courses: "/admin/courses",
      team: "/admin/team",
      contacts: "/admin/contacts",
      preview: "/admin/preview",
      history: "/admin/history",
    };
    router.push(map[next]);
  };

  const handleSaveContent = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSavedContent(data.content);
        setContent(data.content);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(data.error || "Не вдалося зберегти зміни.");
      }
    } catch {
      alert("Помилка збереження на сервері.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelChanges = () => {
    if (confirm("Скасувати незбережені зміни?")) {
      setContent(savedContent);
    }
  };

  const handleUpdateApplicationStatus = async (
    id: string,
    status: ApplicationStatus
  ) => {
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchApplications();
    } catch {
      alert("Не вдалося оновити статус заявки.");
    }
  };

  const handleDeleteApplication = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchApplications();
    } catch {
      alert("Не вдалося видалити заявку.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      /* ignore */
    }
    router.push("/admin/login");
    router.refresh();
  };

  const newApplicationsCount = applications.filter((a) => a.status === "new").length;
  const activeCourses = content.courses.filter((c) => c.enabled).length;
  const activeTeam = content.team.filter((m) => m.enabled).length;

  const tabClass = (id: AdminSection) =>
    `px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors shrink-0 ${
      section === id
        ? "bg-[#ffd51f] text-[#082d20]"
        : "text-white hover:bg-white/10"
    }`;

  return (
    <div className="min-h-screen bg-[#f1f5f3] text-[#13241c] flex flex-col">
      <header className="bg-[#082d20] text-white sticky top-0 z-50 border-b border-[#13563a] shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#13563a] flex items-center justify-center text-[#ffd51f] font-black">
              <Shield className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-white">Löwen Defence®</span>
                <span className="bg-[#ffd51f] text-[#082d20] text-[0.68rem] font-extrabold px-2 py-0.5 rounded-md">
                  АДМІН
                </span>
              </div>
              <span className="text-xs text-[#a9cdb8]">
                Користувач: <b className="text-white">{username}</b>
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs">
            <div className="bg-[#0d3f2c] px-3 py-1.5 rounded-xl border border-[#13563a] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#ffd51f]" />
              <span>
                Курсів: <b>{activeCourses}</b>
              </span>
            </div>
            <div className="bg-[#0d3f2c] px-3 py-1.5 rounded-xl border border-[#13563a] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#ffd51f]" />
              <span>
                Команда: <b>{activeTeam}</b>
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate("applications")}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-colors ${
                newApplicationsCount > 0
                  ? "bg-[#28aa5b] text-white border-green-400 font-extrabold animate-pulse"
                  : "bg-[#0d3f2c] text-white border-[#13563a]"
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>
                Заявок: <b>{newApplicationsCount} нових</b>
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <button
                type="button"
                onClick={handleCancelChanges}
                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl flex items-center gap-1 text-xs font-bold"
                title="Скасувати незбережені зміни"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Скасувати</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveContent}
              disabled={saving}
              className={`btn text-xs py-2 px-4 flex items-center gap-2 ${
                hasUnsavedChanges ? "btn-primary font-black shadow-lg animate-bounce" : "btn-secondary"
              }`}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saveSuccess ? (
                <Check className="w-4 h-4 text-green-700" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>
                {saving
                  ? "Збереження..."
                  : saveSuccess
                    ? "Збережено!"
                    : hasUnsavedChanges
                      ? "Зберегти зміни!"
                      : "Збережено"}
              </span>
            </button>

            <Link
              href="/"
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold"
              title="Перейти на публічний сайт"
            >
              <Eye className="w-4 h-4 text-[#ffd51f]" />
              <span className="hidden sm:inline">На сайт</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 text-red-300 hover:bg-red-900/50 rounded-xl"
              title="Вийти з системи"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto text-xs font-extrabold pb-2">
          <button type="button" onClick={() => navigate("dashboard")} className={tabClass("dashboard")}>
            <LayoutDashboard className="w-4 h-4" />
            <span>Огляд</span>
          </button>
          <button type="button" onClick={() => navigate("applications")} className={tabClass("applications")}>
            <Inbox className="w-4 h-4" />
            <span>Заявки</span>
            {newApplicationsCount > 0 && (
              <span className="bg-red-500 text-white text-[0.65rem] px-1.5 py-0.2 rounded-full font-black">
                {newApplicationsCount}
              </span>
            )}
          </button>
          <button type="button" onClick={() => navigate("courses")} className={tabClass("courses")}>
            <BookOpen className="w-4 h-4" />
            <span>Програми ({content.courses.length})</span>
          </button>
          <button type="button" onClick={() => navigate("team")} className={tabClass("team")}>
            <Users className="w-4 h-4" />
            <span>Команда ({content.team.length})</span>
          </button>
          <button type="button" onClick={() => navigate("contacts")} className={tabClass("contacts")}>
            <PhoneCall className="w-4 h-4" />
            <span>Контакти</span>
          </button>
          <button type="button" onClick={() => navigate("preview")} className={tabClass("preview")}>
            <Monitor className="w-4 h-4" />
            <span>Предпросмотр</span>
          </button>
          <button type="button" onClick={() => navigate("history")} className={tabClass("history")}>
            <HistoryIcon className="w-4 h-4" />
            <span>Історія версій</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1">
        {storageConfigured === false && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl flex items-center gap-2 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Локальний режим: дані пишуться в <code>data/</code>. Для продакшену додайте Blob-токени у Vercel.
            </span>
          </div>
        )}

        {hasUnsavedChanges && (
          <div className="mb-4 p-3 bg-[#ffd51f]/20 border border-[#ffd51f] text-[#082d20] rounded-xl flex items-center justify-between gap-2 text-xs font-extrabold">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#082d20]" />
              <span>
                У вас є незбережені зміни! Натисніть «Зберегти зміни», щоб опублікувати їх на сайті.
              </span>
            </div>
            <button
              type="button"
              onClick={handleSaveContent}
              className="px-3 py-1 bg-[#082d20] text-white rounded-lg hover:bg-[#13563a]"
            >
              Опублікувати зараз
            </button>
          </div>
        )}

        {section === "dashboard" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashCard
              title="Активні курси"
              value={String(activeCourses)}
              hint={`з ${content.courses.length} усього`}
              onClick={() => navigate("courses")}
            />
            <DashCard
              title="Команда"
              value={String(activeTeam)}
              hint={`з ${content.team.length} усього`}
              onClick={() => navigate("team")}
            />
            <DashCard
              title="Нові заявки"
              value={String(newApplicationsCount)}
              hint="потребують уваги"
              onClick={() => navigate("applications")}
              highlight={newApplicationsCount > 0}
            />
            <DashCard
              title="Оновлено"
              value={
                content.updatedAt
                  ? new Date(content.updatedAt).toLocaleString("uk-UA")
                  : "—"
              }
              hint="останнє збереження контенту"
              onClick={() => navigate("history")}
            />
          </div>
        )}

        {section === "applications" && (
          <ApplicationsManager
            applications={applications}
            onUpdateStatus={handleUpdateApplicationStatus}
            onDeleteApplication={handleDeleteApplication}
          />
        )}

        {section === "courses" && (
          <CoursesEditor
            courses={content.courses}
            onChange={(updatedCourses) =>
              setContent({ ...content, courses: updatedCourses })
            }
          />
        )}

        {section === "team" && (
          <TeamEditor
            team={content.team}
            onChange={(updatedTeam) => setContent({ ...content, team: updatedTeam })}
          />
        )}

        {section === "contacts" && (
          <ContactsEditor
            contacts={content.contacts}
            onChange={(updatedContacts) =>
              setContent({ ...content, contacts: updatedContacts })
            }
          />
        )}

        {section === "preview" && (
          <DeviceFramePreview>
            <PublicSite content={content} showAdminLink={false} />
          </DeviceFramePreview>
        )}

        {section === "history" && (
          <HistoryManager
            onRestore={(restored) => {
              setContent(restored);
              setSavedContent(restored);
            }}
          />
        )}
      </main>
    </div>
  );
};

function DashCard({
  title,
  value,
  hint,
  onClick,
  highlight,
}: {
  title: string;
  value: string;
  hint: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-5 rounded-2xl border shadow-sm transition-all hover:-translate-y-0.5 ${
        highlight
          ? "bg-[#28aa5b] text-white border-green-400"
          : "bg-white border-gray-200 text-[#082d20]"
      }`}
    >
      <div className="text-xs font-extrabold uppercase tracking-wider opacity-70">{title}</div>
      <div className="text-2xl font-black mt-2 break-words">{value}</div>
      <div className={`text-xs mt-1 ${highlight ? "text-white/80" : "text-[#64726a]"}`}>
        {hint}
      </div>
    </button>
  );
}
