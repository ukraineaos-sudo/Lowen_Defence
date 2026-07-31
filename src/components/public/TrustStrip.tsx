/**
 * TrustStrip.tsx — стрічка довіри / партнери
 */
"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export const TrustStrip: React.FC = () => {
  const { dict } = useI18n();

  return (
    <div className="trust-strip">
      <div className="container trust-items">
        {dict.trust.items.map((item, index) => (
          <div key={index} className="trust-item">
            <CheckCircle2
              className="w-5 h-5 text-[#082d20] stroke-[2.5] shrink-0"
              aria-hidden
            />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
