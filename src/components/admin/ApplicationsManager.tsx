import React, { useState } from "react";
import { CourseApplication, ApplicationStatus } from "../../types/application";
import { Phone, CheckCircle, Clock, Trash2, Search, Filter } from "lucide-react";

interface ApplicationsManagerProps {
  applications: CourseApplication[];
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onDeleteApplication: (id: string) => void;
}

export const ApplicationsManager: React.FC<ApplicationsManagerProps> = ({
  applications,
  onUpdateStatus,
  onDeleteApplication,
}) => {
  const [filter, setFilter] = useState<"all" | "new" | "processed">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredApps = applications.filter((app) => {
    if (filter === "new" && app.status !== "new") return false;
    if (filter === "processed" && app.status !== "processed") return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = app.name.toLowerCase().includes(term);
      const matchPhone = app.phone.toLowerCase().includes(term);
      const matchCourse = app.courseTitleSnapshot.toLowerCase().includes(term);
      return matchName || matchPhone || matchCourse;
    }
    return true;
  });

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Пошук за ім'ям, телефоном..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <Filter className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === "all"
                ? "bg-[#082d20] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Всі ({applications.length})
          </button>
          <button
            onClick={() => setFilter("new")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === "new"
                ? "bg-[#28aa5b] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Нові ({applications.filter((a) => a.status === "new").length})
          </button>
          <button
            onClick={() => setFilter("processed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === "processed"
                ? "bg-[#0d3f2c] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Опрацьовані ({applications.filter((a) => a.status === "processed").length})
          </button>
        </div>
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <div className="py-12 bg-white rounded-2xl border border-gray-200 text-center text-gray-500 text-sm">
          Заявок не знайдено.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app) => {
            const isNew = app.status === "new";

            return (
              <div
                key={app.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isNew
                    ? "bg-white border-[#28aa5b] shadow-sm"
                    : "bg-[#f8faf8] border-gray-200 opacity-80"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[0.7rem] font-black uppercase tracking-wider flex items-center gap-1 ${
                        isNew
                          ? "bg-[#28aa5b] text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {isNew ? (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>Нова заявка</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>Опрацьована</span>
                        </>
                      )}
                    </span>

                    <span className="text-xs text-gray-400 font-medium">
                      {formatDate(app.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        onUpdateStatus(
                          app.id,
                          isNew ? "processed" : "new"
                        )
                      }
                      className={`btn text-xs py-1 px-3 ${
                        isNew ? "btn-primary" : "btn-dark"
                      }`}
                    >
                      {isNew ? "Позначити опрацьованою" : "Повернути у Нові"}
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Видалити заявку від ${app.name}?`)) {
                          onDeleteApplication(app.id);
                        }
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Видалити"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 text-sm">
                  <div>
                    <span className="block text-xs text-gray-400 font-bold">
                      Заявник:
                    </span>
                    <strong className="text-[#082d20] font-black text-base">
                      {app.name}
                    </strong>
                    <a
                      href={`tel:${app.phone.replace(/[^0-9+]/g, "")}`}
                      className="flex items-center gap-1.5 text-[#1b7048] font-extrabold mt-1 hover:underline text-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{app.phone}</span>
                    </a>
                  </div>

                  <div>
                    <span className="block text-xs text-gray-400 font-bold">
                      Обраний курс / напрямок:
                    </span>
                    <span className="inline-block mt-1 font-bold text-[#0d3f2c] bg-[#edf5ef] px-2.5 py-1 rounded-lg text-xs">
                      {app.courseTitleSnapshot}
                    </span>
                  </div>

                  <div>
                    <span className="block text-xs text-gray-400 font-bold">
                      Коментар:
                    </span>
                    <p className="text-xs text-gray-700 mt-1 leading-relaxed italic">
                      {app.comment || "Без коментаря"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
