/**
 * AdminShell.tsx — оболонка адмінки: сесія, save, таби, editors
 */
"use client";

import React, { useEffect, useRef, useState } from "react";
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
import { PasswordChangeForm } from "./PasswordChangeForm";
import { PublicSite } from "@/components/PublicSite";
import {
  adminFetch,
  redirectSessionExpired,
} from "@/lib/admin/admin-fetch";
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
  KeyRound,
} from "lucide-react";

export type AdminSection =
  | "dashboard"
  | "applications"
  | "courses"
  | "team"
  | "contacts"
  | "preview"
  | "history"
  | "security";

interface AdminShellProps {
  initialContent: SiteContent;
  initialRevision: string | null;
  username: string;
  section: AdminSection;
}

type Notice = { type: "success" | "warning" | "error"; text: string };

export const AdminShell: React.FC<AdminShellProps> = ({
  initialContent,
  initialRevision,
  username,
  section,
}) => {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent>(() =>
    structuredClone(initialContent)
  );
  const [savedContent, setSavedContent] = useState<SiteContent>(() =>
    structuredClone(initialContent)
  );
  const [revision, setRevision] = useState<string | null>(initialRevision);
  const [applications, setApplications] = useState<CourseApplication[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [storageConfigured, setStorageConfigured] = useState<boolean | null>(null);
  const [storageHint, setStorageHint] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const appsInFlight = useRef(false);
  const stopAppsPolling = useRef(false);

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
    void (async () => {
      const result = await adminFetch<{
        authenticated?: boolean;
        storageConfigured?: boolean;
        storage?: {
          data?: { configured?: boolean };
          media?: { configured?: boolean };
        };
      }>("/api/auth/session");
      if (!result.ok) return;
      if (result.data.authenticated === false) {
        redirectSessionExpired();
        return;
      }
      if (result.data.storageConfigured !== undefined) {
        setStorageConfigured(result.data.storageConfigured);
      }
      if (result.data.storage) {
        const missing: string[] = [];
        if (!result.data.storage.data?.configured) missing.push("Data Blob");
        if (!result.data.storage.media?.configured) missing.push("Media Blob");
        setStorageHint(
          missing.length
            ? `Не налаштовано: ${missing.join(", ")}. Локально — data/; на проді потрібні обидва токени.`
            : null
        );
      }
    })();
  }, []);

  const fetchApplications = async () => {
    if (appsInFlight.current || stopAppsPolling.current) return;
    appsInFlight.current = true;
    try {
      const result = await adminFetch<{
        applications?: CourseApplication[];
      }>("/api/admin/applications");
      if (!result.ok) {
        if (result.error.status === 401) {
          stopAppsPolling.current = true;
          return;
        }
        if (result.error.status === 503) {
          setNotice({ type: "warning", text: result.error.message });
        }
        return;
      }
      setApplications(result.data.applications || []);
      setNotice((prev) => (prev?.type === "warning" ? null : prev));
    } finally {
      appsInFlight.current = false;
    }
  };

  useEffect(() => {
    void fetchApplications();
    const interval = setInterval(() => {
      void fetchApplications();
    }, 30000);
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
      security: "/admin/security",
    };
    router.push(map[next]);
  };

  const handleSaveContent = async () => {
    setSaving(true);
    setSaveSuccess(false);

    const result = await adminFetch<{
      success?: boolean;
      content?: SiteContent;
      revision?: string;
      code?: string;
      message?: string;
    }>("/api/admin/content", {
      method: "POST",
      body: JSON.stringify({
        expectedRevision: revision,
        content,
      }),
    });

    if (result.ok && result.data.success && result.data.content) {
      const next = structuredClone(result.data.content);
      setSavedContent(next);
      setContent(structuredClone(next));
      setRevision(
        typeof result.data.revision === "string"
          ? result.data.revision
          : revision
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (result.data.code === "CONTENT_STATE_WRITE_FAILED") {
        setNotice({
          type: "warning",
          text:
            result.data.message ||
            "Контент збережено, але state marker не оновлено. Збережіть ще раз.",
        });
      }
    } else if (
      !result.ok &&
      (result.error.status === 409 || result.error.code === "CONTENT_CONFLICT")
    ) {
      setConflictOpen(true);
    } else if (!result.ok && result.error.status !== 401) {
      setNotice({
        type: "error",
        text: result.error.message || "Не вдалося зберегти зміни.",
      });
    }
    setSaving(false);
  };

  const loadRemoteVersion = async () => {
    if (
      !confirm(
        "Ваша поточна чернетка буде втрачена.\nЗавантажити актуальну версію?"
      )
    ) {
      return;
    }
    const result = await adminFetch<{
      content?: SiteContent;
      revision?: string;
    }>("/api/admin/content");
    if (!result.ok) {
      if (result.error.status !== 401) {
        setNotice({
          type: "error",
          text: result.error.message || "Не вдалося завантажити актуальну версію.",
        });
      }
      return;
    }
    if (!result.data.content) {
      setNotice({
        type: "error",
        text: "Не вдалося завантажити актуальну версію.",
      });
      return;
    }
    const next = structuredClone(result.data.content);
    setContent(next);
    setSavedContent(structuredClone(next));
    setRevision(
      typeof result.data.revision === "string" ? result.data.revision : null
    );
    setConflictOpen(false);
  };

  const handleCancelChanges = () => {
    if (confirm("Скасувати незбережені зміни?")) {
      setContent(structuredClone(savedContent));
    }
  };

  const handleUpdateApplicationStatus = async (
    id: string,
    status: ApplicationStatus
  ) => {
    const result = await adminFetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (result.ok) {
      void fetchApplications();
      return;
    }
    if (result.error.status !== 401) {
      setNotice({
        type: "error",
        text: result.error.message || "Не вдалося оновити статус заявки.",
      });
    }
  };

  const handleDeleteApplication = async (id: string) => {
    const result = await adminFetch(`/api/admin/applications/${id}`, {
      method: "DELETE",
    });
    if (result.ok) {
      void fetchApplications();
      return;
    }
    if (result.error.status !== 401) {
      setNotice({
        type: "error",
        text: result.error.message || "Не вдалося видалити заявку.",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await adminFetch("/api/auth/logout", { method: "POST" });
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
            <span>Попередній перегляд</span>
          </button>
          <button type="button" onClick={() => navigate("history")} className={tabClass("history")}>
            <HistoryIcon className="w-4 h-4" />
            <span>Історія версій</span>
          </button>
          <button type="button" onClick={() => navigate("security")} className={tabClass("security")}>
            <KeyRound className="w-4 h-4" />
            <span>Пароль</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1">
        {storageConfigured === false && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl flex items-center gap-2 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {storageHint ||
                "Локальний режим: дані пишуться в data/. Для продакшену додайте обидва Blob-токени (Data + Media) у Vercel."}
            </span>
          </div>
        )}

        {notice && (
          <div
            className={`mb-4 p-3 rounded-xl flex items-center justify-between gap-2 text-xs font-bold border ${
              notice.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : notice.type === "warning"
                  ? "bg-amber-50 border-amber-300 text-amber-900"
                  : "bg-green-50 border-green-200 text-green-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{notice.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="underline opacity-80 hover:opacity-100"
            >
              Закрити
            </button>
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
            expectedRevision={revision}
            onRestore={(restored, nextRevision) => {
              setContent(restored);
              setSavedContent(restored);
              setRevision(nextRevision);
            }}
          />
        )}

        {section === "security" && <PasswordChangeForm />}
      </main>

      {conflictOpen && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-amber-300 shadow-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-black text-[#082d20]">
                  Контент уже змінено
                </h2>
                <p className="text-sm text-[#64726a] mt-1">
                  Інша вкладка або пристрій зберегли новішу версію. Ваші зміни не
                  були записані. Чернетка в цій вкладці збережена.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setConflictOpen(false)}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-bold text-[#082d20]"
              >
                Продовжити редагування
              </button>
              <button
                type="button"
                onClick={loadRemoteVersion}
                className="rounded-full bg-[#082d20] text-white px-4 py-2 text-sm font-bold"
              >
                Завантажити актуальну версію
              </button>
            </div>
          </div>
        </div>
      )}
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
