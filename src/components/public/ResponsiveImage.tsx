/**
 * ResponsiveImage.tsx — img з object-position від focalX/Y
 */
import React, { useState } from "react";
import { ResponsiveImageData } from "../../types/content";
import { localizedUk } from "@/lib/i18n/localized";
import { ShieldAlert } from "lucide-react";

interface ResponsiveImageProps {
  image?:
    | ResponsiveImageData
    | { url: string; alt: string; focalX: number; focalY: number };
  fallbackAlt?: string;
  className?: string;
  aspectRatio?: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  image,
  fallbackAlt = "Löwen Defence",
  className = "",
  aspectRatio,
}) => {
  const [hasError, setHasError] = useState(false);
  const altText = image?.alt ? localizedUk(image.alt) : fallbackAlt;

  if (!image || !image.url || hasError) {
    return (
      <div
        className={`w-full h-full bg-[#0d3f2c] text-white flex flex-col items-center justify-center p-4 text-center select-none ${className}`}
        style={{ aspectRatio }}
      >
        <ShieldAlert className="w-10 h-10 mb-2 opacity-80" />
        <span className="font-extrabold text-sm tracking-wide text-white">
          Löwen Defence®
        </span>
        <span className="text-xs text-[#a9cdb8] mt-1">{altText}</span>
      </div>
    );
  }

  const focalX = image.focalX ?? 50;
  const focalY = image.focalY ?? 50;

  return (
    <img
      src={image.url}
      alt={altText || fallbackAlt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`w-full h-full object-cover ${className}`}
      style={{
        objectPosition: `${focalX}% ${focalY}%`,
        aspectRatio,
      }}
    />
  );
};
