import React, { useState } from "react";
import { Monitor, Tablet, Smartphone, Eye } from "lucide-react";

interface DeviceFramePreviewProps {
  children: React.ReactNode;
}

export const DeviceFramePreview: React.FC<DeviceFramePreviewProps> = ({
  children,
}) => {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between bg-[#082d20] text-white p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#ffd51f]" />
          <span className="font-extrabold text-sm">Попередній перегляд сайту на пристроях:</span>
        </div>

        <div className="flex items-center gap-1 bg-[#13563a] p-1 rounded-xl">
          <button
            onClick={() => setDevice("desktop")}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              device === "desktop"
                ? "bg-[#ffd51f] text-[#082d20]"
                : "text-white hover:bg-white/10"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setDevice("tablet")}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              device === "tablet"
                ? "bg-[#ffd51f] text-[#082d20]"
                : "text-white hover:bg-white/10"
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet (768px)</span>
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              device === "mobile"
                ? "bg-[#ffd51f] text-[#082d20]"
                : "text-white hover:bg-white/10"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile (375px)</span>
          </button>
        </div>
      </div>

      <div className="flex justify-center bg-gray-900 p-4 rounded-2xl overflow-x-auto min-h-[600px]">
        <div
          className={`bg-white transition-all duration-300 overflow-y-auto max-h-[750px] shadow-2xl rounded-xl ${
            device === "desktop"
              ? "w-full"
              : device === "tablet"
              ? "w-[768px] border-8 border-gray-800 rounded-3xl"
              : "w-[375px] border-[12px] border-gray-800 rounded-[40px]"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
