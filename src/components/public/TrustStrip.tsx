/**
 * TrustStrip.tsx — стрічка довіри / партнери
 */
import React from "react";
import { CheckCircle2 } from "lucide-react";

export const TrustStrip: React.FC = () => {
  const items = [
    "Без залякування",
    "Адаптовано за віком",
    "Навчені тренери",
    "Сертифікат учасника",
  ];

  return (
    <div className="trust-strip">
      <div className="container trust-items">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#082d20] stroke-[2.5] shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
