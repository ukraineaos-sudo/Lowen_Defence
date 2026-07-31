/**
 * BusinessSection.tsx — корпоративні програми
 */
"use client";

import React from "react";
import { ResponsiveImage } from "./ResponsiveImage";
import {
  ArrowRight,
  Building2,
  ShieldCheck,
  MessageSquare,
  Flame,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface BusinessSectionProps {
  onSelectBusiness: () => void;
}

export const BusinessSection: React.FC<BusinessSectionProps> = ({
  onSelectBusiness,
}) => {
  const { dict } = useI18n();

  const icons = [
    <MessageSquare key="msg" className="w-5 h-5 text-white mb-2" />,
    <ShieldCheck key="shield" className="w-5 h-5 text-white mb-2" />,
    <Flame key="flame" className="w-5 h-5 text-white mb-2" />,
    <Building2 key="building" className="w-5 h-5 text-white mb-2" />,
  ];

  return (
    <section className="business" id="business">
      <div className="container business-grid">
        <div>
          <span className="eyebrow" style={{ color: "#d2e6d8" }}>
            {dict.business.eyebrow}
          </span>
          <h2>{dict.business.title}</h2>
          <p className="section-lead">{dict.business.lead}</p>

          <div className="business-list">
            {dict.business.blocks.map((title, idx) => (
              <div
                key={idx}
                className="flex flex-col items-start justify-center p-4 rounded-2xl bg-[#0d3f2c] border border-[#1b7048]/50"
              >
                {icons[idx]}
                <span className="font-bold text-sm leading-snug text-white">
                  {title}
                </span>
              </div>
            ))}
          </div>

          <button onClick={onSelectBusiness} className="btn btn-primary">
            <span>{dict.business.cta}</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <div className="business-image">
          <ResponsiveImage
            image={{
              url: "/business/business-training.png",
              alt: dict.business.imageAlt,
              focalX: 50,
              focalY: 50,
            }}
          />
        </div>
      </div>
    </section>
  );
};
