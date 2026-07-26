/**
 * HistoryManager.tsx — історія версій контенту + rollback
 */
import React, { useState, useEffect } from "react";
import { ContentHistoryBackup, SiteContent } from "../../types/content";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { History, RotateCcw, Clock, ShieldAlert } from "lucide-react";

interface HistoryManagerProps {
  expectedRevision: string | null;
  onRestore: (restoredContent: SiteContent, revision: string | null) => void;
}

export const HistoryManager: React.FC<HistoryManagerProps> = ({
  expectedRevision,
  onRestore,
}) => {
  const [backups, setBackups] = useState<ContentHistoryBackup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rollingBack, setRollingBack] = useState(false);

  const fetchHistory = async () => {
    setError(null);
    setLoading(true);
    const result = await adminFetch<ContentHistoryBackup[]>("/api/admin/history");
    if (!result.ok) {
      if (result.error.status !== 401) {
        setError(result.error.message || "Не вдалося завантажити історію версій.");
      }
      setLoading(false);
      return;
    }
    setBackups(Array.isArray(result.data) ? result.data : []);
    setLoading(false);
  };

  useEffect(() => {
    void fetchHistory();
  }, []);

  const handleRollback = async (backup: ContentHistoryBackup) => {
    if (rollingBack) return;
    if (
      !confirm(
        `Ви дійсно бажаєте відновити версію від ${backup.updatedAt}? Поточні незбережені зміни будуть замінені.`
      )
    ) {
      return;
    }

    setRollingBack(true);
    const result = await adminFetch<{
      content?: SiteContent;
      revision?: string;
    }>("/api/admin/rollback", {
      method: "POST",
      body: JSON.stringify({
        timestamp: backup.timestamp,
        expectedRevision,
      }),
    });

    if (result.ok && result.data.content) {
      onRestore(
        result.data.content,
        typeof result.data.revision === "string" ? result.data.revision : null
      );
      await fetchHistory();
      alert("Версію успішно відновлено!");
    } else if (
      !result.ok &&
      (result.error.status === 409 || result.error.code === "CONTENT_CONFLICT")
    ) {
      alert(
        result.error.message ||
          "Контент уже змінено в іншій вкладці. Оновіть сторінку та спробуйте знову."
      );
    } else if (!result.ok && result.error.status !== 401) {
      alert(result.error.message || "Не вдалося відновити версію.");
    }
    setRollingBack(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
      <div className="pb-3 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="font-black text-lg text-[#082d20] flex items-center gap-2">
            <History className="w-5 h-5 text-[#28aa5b]" />
            <span>Історія збережень та відкат версій</span>
          </h3>
          <p className="text-xs text-[#64726a] mt-1">
            Перед кожним збереженням створюється резервна копія. Ви можете повернутися до будь-якої з попередніх версій.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchHistory()}
          disabled={loading || rollingBack}
          className="btn btn-secondary text-xs py-1.5 px-3 text-[#082d20] border-gray-300 disabled:opacity-50"
        >
          Оновити список
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-gray-500">
          Завантаження історії версій...
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : backups.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500">
          Резервні копії ще не створені. Після першого збереження змінених даних тут з’явиться історія.
        </div>
      ) : (
        <div className="space-y-2">
          {backups.map((backup, idx) => (
            <div
              key={backup.timestamp}
              className="p-3.5 bg-[#f8faf8] border border-gray-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-[#1b7048] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#1b7048] shrink-0" />
                <div>
                  <span className="font-extrabold text-sm text-[#082d20] block">
                    Версія #{backups.length - idx} ({new Date(backup.updatedAt).toLocaleString("uk-UA")})
                  </span>
                  <span className="text-xs text-[#64726a]">
                    Курсів: {backup.coursesCount} · Команда: {backup.teamCount} осіб
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleRollback(backup)}
                disabled={rollingBack}
                className="btn btn-dark text-xs py-1.5 px-3 flex items-center gap-1.5 self-end sm:self-center disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{rollingBack ? "Відновлення…" : "Відновити цю версію"}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
