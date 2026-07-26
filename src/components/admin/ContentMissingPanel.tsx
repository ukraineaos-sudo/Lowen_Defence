/**
 * ContentMissingPanel.tsx — аварійний екран: current відсутній, default заборонено
 */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  History,
  RefreshCw,
  RotateCcw,
  Loader2,
} from "lucide-react";
import type { ContentHistoryBackup } from "@/src/types/content";

interface ContentMissingPanelProps {
  error: string;
}

export const ContentMissingPanel: React.FC<ContentMissingPanelProps> = ({
  error,
}) => {
  const router = useRouter();
  const [backups, setBackups] = useState<ContentHistoryBackup[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const loadHistory = async () => {
    setListError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/history", { credentials: "include" });
      if (!res.ok) {
        setListError("Не вдалося завантажити історію версій.");
        setBackups([]);
        return;
      }
      const data = await res.json();
      setBackups(Array.isArray(data) ? data : []);
    } catch {
      setListError("Помилка зв’язку із сервером.");
      setBackups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const restore = async (timestamp: string) => {
    if (busy) return;
    if (
      !confirm(
        "Відновити контент з історії? Сайт отримає цю версію як поточну. Default не буде застосовано."
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/rollback", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp,
          expectedRevision: null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.content) {
        alert("Контент відновлено. Перезавантажуємо адмінку…");
        router.refresh();
        window.location.href = "/admin";
        return;
      }
      if (res.status === 409 || data.code === "CONTENT_CONFLICT") {
        alert(
          data.error ||
            "Контент уже з’явився або змінений. Оновіть сторінку."
        );
        return;
      }
      alert(data.error || "Не вдалося відновити версію.");
    } catch {
      alert("Помилка під час відновлення.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8faf8] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white border border-amber-300 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h1 className="text-lg font-black text-[#082d20] mb-1">
              Основний файл контенту відсутній
            </h1>
            <p className="text-sm text-[#64726a]">{error}</p>
            <p className="text-sm text-[#64726a] mt-2">
              Сайт не буде перезаписаний даними за замовчуванням. Відновіть
              останню доступну версію з історії.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || loading || backups.length === 0}
            onClick={() => restore("latest")}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#082d20] text-white text-sm font-bold px-4 py-2 disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            Відновити останню версію
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              router.refresh();
              window.location.reload();
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 text-[#082d20] text-sm font-bold px-4 py-2"
          >
            <RefreshCw className="w-4 h-4" />
            Повторити перевірку
          </button>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-sm font-black text-[#082d20] flex items-center gap-2 mb-2">
            <History className="w-4 h-4 text-[#28aa5b]" />
            Доступні резервні копії
          </h2>
          {loading ? (
            <p className="text-xs text-[#64726a]">Завантаження…</p>
          ) : listError ? (
            <p className="text-xs text-red-700">{listError}</p>
          ) : backups.length === 0 ? (
            <p className="text-xs text-[#64726a]">
              Історія порожня. Потрібне ручне відновлення Blob (put валідного
              site-content.json).
            </p>
          ) : (
            <ul className="space-y-2 max-h-56 overflow-y-auto">
              {backups.map((b, idx) => (
                <li
                  key={b.timestamp}
                  className="flex items-center justify-between gap-2 text-xs bg-[#f8faf8] border border-gray-200 rounded-xl px-3 py-2"
                >
                  <span className="text-[#082d20] font-bold">
                    #{backups.length - idx} ·{" "}
                    {new Date(b.updatedAt).toLocaleString("uk-UA")}
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => restore(b.timestamp)}
                    className="font-bold text-[#1b7048] hover:underline disabled:opacity-50"
                  >
                    Відновити
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
};
