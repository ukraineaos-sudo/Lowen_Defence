/**
 * TeamEditor.tsx — редактор команди в адмінці
 * Список учасників, enabled/порядок, фото + опис.
 */
import React, { useState } from "react";
import { TeamMember } from "../../types/content";
import { ImageFocalPointPicker } from "./ImageFocalPointPicker";
import { localizedUk, withLocalizedUk } from "@/lib/i18n/localized";
import { ArrowUp, ArrowDown, Eye, EyeOff, Plus, Trash2 } from "lucide-react";

interface TeamEditorProps {
  team: TeamMember[];
  onChange: (updatedTeam: TeamMember[]) => void;
}

export const TeamEditor: React.FC<TeamEditorProps> = ({
  team,
  onChange,
}) => {
  const [editingId, setEditingId] = useState<string | null>(team[0]?.id || null);

  // --- 1. Порядок / enabled / CRUD учасника ---
  const moveMember = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= team.length) return;

    const swapped = team.map((m, i) => {
      if (i === index) return team[targetIndex]!;
      if (i === targetIndex) return team[index]!;
      return m;
    });
    onChange(swapped.map((member, i) => ({ ...member, order: i + 1 })));
  };

  const toggleEnabled = (id: string) => {
    const updated = team.map((m) =>
      m.id === id ? { ...m, enabled: !m.enabled } : m
    );
    onChange(updated);
  };

  const updateMember = (id: string, updatedFields: Partial<TeamMember>) => {
    const updated = team.map((m) =>
      m.id === id ? { ...m, ...updatedFields } : m
    );
    onChange(updated);
  };

  const addMember = () => {
    const newId = `team-${Date.now()}`;
    const newMember: TeamMember = {
      id: newId,
      enabled: true,
      order: team.length + 1,
      name: "Ім’я Прізвище",
      description: "Посада або опис внеску в проєкт.",
      image: {
        url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
        alt: "Учасник команди",
        focalX: 50,
        focalY: 30,
      },
    };
    onChange([...team, newMember]);
    setEditingId(newId);
  };

  const deleteMember = (id: string, name: string) => {
    if (confirm(`Ви дійсно бажаєте видалити учасника "${name}"?`)) {
      const filtered = team
        .filter((m) => m.id !== id)
        .map((m, idx) => ({ ...m, order: idx + 1 }));
      onChange(filtered);
      if (editingId === id) {
        setEditingId(filtered[0]?.id || null);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* --- 2. Список команди (ліва колонка) --- */}
      <div className="lg:col-span-5 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-black text-lg text-[#082d20]">Команда ({team.length})</h3>
          <button
            onClick={addMember}
            className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Додати до команди</span>
          </button>
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {team.map((member, index) => {
            const isSelected = member.id === editingId;

            return (
              <div
                key={member.id}
                onClick={() => setEditingId(member.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-[#082d20] text-white border-[#13563a] shadow-lg"
                    : "bg-white text-[#13241c] border-gray-200 hover:border-[#1b7048]"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveMember(index, "up");
                      }}
                      disabled={index === 0}
                      className="p-1 hover:bg-black/10 rounded disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveMember(index, "down");
                      }}
                      disabled={index === team.length - 1}
                      className="p-1 hover:bg-black/10 rounded disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black opacity-60">#{index + 1}</span>
                      <span className="font-extrabold text-sm truncate">
                        {localizedUk(member.name)}
                      </span>
                    </div>
                    <p className="text-xs opacity-75 truncate mt-0.5">
                      {localizedUk(member.description)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    title={member.enabled ? "Активний" : "Прихований"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleEnabled(member.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      member.enabled ? "text-[#28aa5b]" : "text-red-400 opacity-60"
                    }`}
                  >
                    {member.enabled ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Member Edit Form */}
      {/* --- 3. Форма обраного учасника --- */}
      <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        {editingId ? (
          (() => {
            const member = team.find((m) => m.id === editingId);
            if (!member) return <div>Оберіть учасника для редагування</div>;

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <h3 className="font-black text-lg text-[#082d20]">
                    Редагування профілю
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      deleteMember(member.id, localizedUk(member.name))
                    }
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 text-xs font-bold"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Видалити</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#082d20] mb-1">
                    Ім’я та Прізвище
                  </label>
                  <input
                    type="text"
                    value={localizedUk(member.name)}
                    onChange={(e) =>
                      updateMember(member.id, {
                        name: withLocalizedUk(member.name, e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-extrabold"
                    placeholder="Фелікс Тимченко"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#082d20] mb-1">
                    Посада та опис
                  </label>
                  <textarea
                    rows={3}
                    value={localizedUk(member.description)}
                    onChange={(e) =>
                      updateMember(member.id, {
                        description: withLocalizedUk(
                          member.description,
                          e.target.value
                        ),
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs leading-relaxed"
                    placeholder="Засновник, автор методики..."
                  />
                </div>

                {/* Image Picker */}
                <ImageFocalPointPicker
                  image={member.image}
                  folderName={`team/${member.id}`}
                  onChange={(updatedImg) =>
                    updateMember(member.id, { image: updatedImg })
                  }
                />
              </div>
            );
          })()
        ) : (
          <div className="py-12 text-center text-gray-500">
            Оберіть учасника зі списку ліворуч.
          </div>
        )}
      </div>
    </div>
  );
};
