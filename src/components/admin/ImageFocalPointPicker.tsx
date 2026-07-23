import React, { useRef, useState } from "react";
import { ResponsiveImageData } from "../../types/content";
import { Upload, Focus, RefreshCw, Smartphone, Monitor, Tablet } from "lucide-react";

interface ImageFocalPointPickerProps {
  image: ResponsiveImageData;
  folderName: string;
  onChange: (updatedImage: ResponsiveImageData) => void;
  authToken?: string;
}

export const ImageFocalPointPicker: React.FC<ImageFocalPointPickerProps> = ({
  image,
  folderName,
  onChange,
  authToken,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const imageRef = useRef<HTMLImageElement>(null);

  const focalX = image.focalX ?? 50;
  const focalY = image.focalY ?? 50;

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    onChange({
      ...image,
      focalX: clampedX,
      focalY: clampedY,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Будь ласка, оберіть файл зображення (JPEG, PNG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Файл занадто великий. Максимальний розмір — 10 МБ.");
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;

        // Try server upload endpoint
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dataUrl,
            fileName: file.name,
            folder: folderName,
          }),
        });

        const data = await res.json();
        if (res.ok && data.url) {
          onChange({
            ...image,
            url: data.url,
            alt: image.alt || file.name.split(".")[0],
          });
        } else if (data && data.error) {
          alert(data.error);
          // Still update local preview with dataUrl for instant feedback
          onChange({
            ...image,
            url: dataUrl,
            alt: image.alt || file.name.split(".")[0],
          });
        } else {
          // Fallback to dataUrl in client state
          onChange({
            ...image,
            url: dataUrl,
            alt: image.alt || file.name.split(".")[0],
          });
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert("Помилка завантаження файлу.");
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 bg-[#f8faf8] border border-[#dbe5dd] rounded-2xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-black uppercase tracking-wider text-[#082d20] flex items-center gap-1.5">
          <Focus className="w-4 h-4 text-[#28aa5b]" />
          <span>Зображення та Фокусна точка (X: {focalX}%, Y: {focalY}%)</span>
        </label>

        {/* Upload Button */}
        <label className="btn btn-dark text-xs py-1.5 px-3.5 gap-1.5 cursor-pointer">
          {uploading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          <span>Завантажити фото</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Image URL & Alt Text Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-[#64726a] font-bold mb-1">URL фото</label>
          <input
            type="text"
            value={image.url || ""}
            onChange={(e) => onChange({ ...image, url: e.target.value })}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg p-2 text-xs"
          />
        </div>
        <div>
          <label className="block text-[#64726a] font-bold mb-1">Alt опис (SEO)</label>
          <input
            type="text"
            value={image.alt || ""}
            onChange={(e) => onChange({ ...image, alt: e.target.value })}
            placeholder="Опис фото..."
            className="w-full border border-gray-300 rounded-lg p-2 text-xs"
          />
        </div>
      </div>

      {/* Interactive Focal Point Picker */}
      {image.url && (
        <div className="space-y-2">
          <p className="text-[0.75rem] text-[#64726a]">
            💡 Клікніть по зображенню в потрібному місці, щоб встановити точку фокусу для обрізання на телефонах і планшетах.
          </p>

          <div className="relative group overflow-hidden rounded-xl border border-gray-300 bg-gray-900 flex items-center justify-center min-h-[200px] cursor-crosshair">
            <img
              ref={imageRef}
              src={image.url}
              alt={image.alt || "Preview"}
              onClick={handleImageClick}
              className="w-full max-h-[260px] object-contain select-none"
              referrerPolicy="no-referrer"
            />

            {/* Target Crosshair Marker */}
            <div
              className="absolute w-7 h-7 rounded-full border-2 border-[#ffd51f] bg-[#082d20]/60 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center shadow-lg transition-all"
              style={{
                left: `${focalX}%`,
                top: `${focalY}%`,
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#ffd51f]" />
            </div>
          </div>

          {/* Device Aspect Ratio Previews */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#082d20]">
                Попередній перегляд обрізання за пристроями:
              </span>
              <div className="flex items-center gap-1 bg-gray-200 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPreviewMode("desktop")}
                  className={`p-1 rounded text-xs font-bold flex items-center gap-1 ${
                    previewMode === "desktop" ? "bg-white text-[#082d20] shadow" : "text-gray-600"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("tablet")}
                  className={`p-1 rounded text-xs font-bold flex items-center gap-1 ${
                    previewMode === "tablet" ? "bg-white text-[#082d20] shadow" : "text-gray-600"
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tablet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("mobile")}
                  className={`p-1 rounded text-xs font-bold flex items-center gap-1 ${
                    previewMode === "mobile" ? "bg-white text-[#082d20] shadow" : "text-gray-600"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            <div
              className={`mx-auto overflow-hidden rounded-xl border-2 border-[#13563a] bg-black transition-all ${
                previewMode === "desktop"
                  ? "w-full h-36"
                  : previewMode === "tablet"
                  ? "w-64 h-36"
                  : "w-36 h-48"
              }`}
            >
              <img
                src={image.url}
                alt={image.alt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                style={{
                  objectPosition: `${focalX}% ${focalY}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
