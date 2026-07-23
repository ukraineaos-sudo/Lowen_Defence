import React, { useState } from "react";
import { Course } from "../../types/content";
import { ImageFocalPointPicker } from "./ImageFocalPointPicker";
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Star,
  Plus,
  Copy,
  Trash2,
  Sparkles,
} from "lucide-react";

interface CoursesEditorProps {
  courses: Course[];
  onChange: (updatedCourses: Course[]) => void;
  authToken?: string;
}

export const CoursesEditor: React.FC<CoursesEditorProps> = ({
  courses,
  onChange,
  authToken,
}) => {
  const [editingId, setEditingId] = useState<string | null>(courses[0]?.id || null);

  const moveCourse = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= courses.length) return;

    const newCourses = [...courses];
    const temp = newCourses[index];
    newCourses[index] = newCourses[targetIndex];
    newCourses[targetIndex] = temp;

    // update order sequence
    newCourses.forEach((c, idx) => (c.order = idx + 1));
    onChange(newCourses);
  };

  const toggleField = (id: string, field: "enabled" | "featured") => {
    const updated = courses.map((c) => {
      if (c.id === id) {
        if (field === "featured") {
          return { ...c, featured: !c.featured };
        }
        return { ...c, [field]: !c[field] };
      } else if (field === "featured") {
        // Only 1 course can be featured
        return { ...c, featured: false };
      }
      return c;
    });
    onChange(updated);
  };

  const updateCourse = (id: string, updatedFields: Partial<Course>) => {
    const updated = courses.map((c) =>
      c.id === id ? { ...c, ...updatedFields } : c
    );
    onChange(updated);
  };

  const addCourse = () => {
    const newId = `course-${Date.now()}`;
    const newCourse: Course = {
      id: newId,
      enabled: true,
      featured: false,
      order: courses.length + 1,
      tag: "Нова програма",
      title: "Новий курс безпеки",
      description: "Опис нового курсу та його ключові переваги для учасників.",
      meta: ["до 14 осіб", "2 години", "очно"],
      price: "1 000 грн",
      priceNote: "за учасника",
      buttonLabel: "Записатися",
      image: {
        url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
        alt: "Новий курс",
        focalX: 50,
        focalY: 50,
      },
    };
    onChange([...courses, newCourse]);
    setEditingId(newId);
  };

  const duplicateCourse = (course: Course) => {
    const newId = `course-${Date.now()}`;
    const copy: Course = {
      ...course,
      id: newId,
      title: `${course.title} (Копія)`,
      order: courses.length + 1,
      featured: false,
    };
    onChange([...courses, copy]);
    setEditingId(newId);
  };

  const deleteCourse = (id: string, title: string) => {
    if (confirm(`Ви дійсно бажаєте видалити курс "${title}"?`)) {
      const filtered = courses.filter((c) => c.id !== id);
      filtered.forEach((c, idx) => (c.order = idx + 1));
      onChange(filtered);
      if (editingId === id) {
        setEditingId(filtered[0]?.id || null);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Course List Sidebar */}
      <div className="lg:col-span-5 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-black text-lg text-[#082d20]">Список програм</h3>
          <button
            onClick={addCourse}
            className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Додати курс</span>
          </button>
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {courses.map((course, index) => {
            const isSelected = course.id === editingId;

            return (
              <div
                key={course.id}
                onClick={() => setEditingId(course.id)}
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
                        moveCourse(index, "up");
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
                        moveCourse(index, "down");
                      }}
                      disabled={index === courses.length - 1}
                      className="p-1 hover:bg-black/10 rounded disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black opacity-60">#{index + 1}</span>
                      <span className="font-extrabold text-sm truncate">
                        {course.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[0.68rem] px-2 py-0.5 rounded-full font-bold ${
                          isSelected
                            ? "bg-[#ffd51f] text-[#082d20]"
                            : "bg-[#edf5ef] text-[#1b7048]"
                        }`}
                      >
                        {course.tag}
                      </span>
                      <span className="text-xs font-semibold opacity-75">
                        {course.price}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    title={course.featured ? "Виділений курс" : "Зробити виділеним"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleField(course.id, "featured");
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      course.featured
                        ? "text-[#ffd51f] bg-[#ffd51f]/20"
                        : "text-gray-400 hover:text-[#ffd51f]"
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>

                  <button
                    type="button"
                    title={course.enabled ? "Активний (видимий)" : "Прихований"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleField(course.id, "enabled");
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      course.enabled
                        ? "text-[#28aa5b]"
                        : "text-red-400 opacity-60"
                    }`}
                  >
                    {course.enabled ? (
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

      {/* Course Edit Form */}
      <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        {editingId ? (
          (() => {
            const course = courses.find((c) => c.id === editingId);
            if (!course) return <div>Оберіть курс для редагування</div>;

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-[#082d20]">
                      Редагування курсу
                    </h3>
                    {course.featured && (
                      <span className="bg-[#ffd51f] text-[#082d20] text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Головна картка</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => duplicateCourse(course)}
                      className="p-1.5 text-gray-600 hover:text-[#1b7048] hover:bg-gray-100 rounded-lg flex items-center gap-1 text-xs font-bold"
                      title="Дублювати курс"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="hidden sm:inline">Дублювати</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCourse(course.id, course.title)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 text-xs font-bold"
                      title="Видалити курс"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Видалити</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="block text-xs font-bold text-[#082d20] mb-1">
                      Віковий / Цільовий тег
                    </label>
                    <input
                      type="text"
                      value={course.tag}
                      onChange={(e) =>
                        updateCourse(course.id, { tag: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-semibold"
                      placeholder="напр. 5–7 років"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#082d20] mb-1">
                      Назва курсу
                    </label>
                    <input
                      type="text"
                      value={course.title}
                      onChange={(e) =>
                        updateCourse(course.id, { title: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-extrabold"
                      placeholder="Назва..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#082d20] mb-1">
                    Опис курсу
                  </label>
                  <textarea
                    rows={3}
                    value={course.description}
                    onChange={(e) =>
                      updateCourse(course.id, { description: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs leading-relaxed"
                    placeholder="Короткий практичний опис..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <label className="block text-xs font-bold text-[#082d20] mb-1">
                      Ціна
                    </label>
                    <input
                      type="text"
                      value={course.price}
                      onChange={(e) =>
                        updateCourse(course.id, { price: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-bold"
                      placeholder="850 грн або За запитом"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#082d20] mb-1">
                      Підпис до ціни
                    </label>
                    <input
                      type="text"
                      value={course.priceNote}
                      onChange={(e) =>
                        updateCourse(course.id, { priceNote: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
                      placeholder="за учасника"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#082d20] mb-1">
                      Текст кнопки
                    </label>
                    <input
                      type="text"
                      value={course.buttonLabel || "Записатися"}
                      onChange={(e) =>
                        updateCourse(course.id, { buttonLabel: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
                      placeholder="Записатися / Дізнатися"
                    />
                  </div>
                </div>

                {/* Metadata List Editor */}
                <div>
                  <label className="block text-xs font-bold text-[#082d20] mb-1">
                    Параметри (мітки форми)
                  </label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {course.meta.map((m, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 border border-gray-300 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-bold"
                      >
                        <span>{m}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newMeta = course.meta.filter((_, i) => i !== idx);
                            updateCourse(course.id, { meta: newMeta });
                          }}
                          className="text-red-500 hover:text-red-700 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const val = prompt("Введіть параметр (напр. 3 години):");
                        if (val && val.trim()) {
                          updateCourse(course.id, {
                            meta: [...course.meta, val.trim()],
                          });
                        }
                      }}
                      className="text-xs bg-[#13563a] text-white px-2.5 py-1 rounded-full font-extrabold hover:bg-[#1b7048]"
                    >
                      + Додати параметр
                    </button>
                  </div>
                </div>

                {/* Image Picker */}
                <ImageFocalPointPicker
                  image={course.image}
                  folderName={`courses/${course.id}`}
                  onChange={(updatedImg) =>
                    updateCourse(course.id, { image: updatedImg })
                  }
                  authToken={authToken}
                />
              </div>
            );
          })()
        ) : (
          <div className="py-12 text-center text-gray-500">
            Оберіть курс зі списку ліворуч для редагування.
          </div>
        )}
      </div>
    </div>
  );
};
