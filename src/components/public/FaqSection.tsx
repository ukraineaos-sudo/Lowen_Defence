/**
 * FaqSection.tsx — FAQ акордеон
 */
"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export const FaqSection: React.FC = () => {
  const { dict } = useI18n();
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleFaq = (index: number) => {
    if (openIndices.includes(index)) {
      setOpenIndices(openIndices.filter((i) => i !== index));
    } else {
      setOpenIndices([...openIndices, index]);
    }
  };

  return (
    <section id="faq">
      <div className="container faq-grid">
        <div>
          <span className="eyebrow">{dict.faq.eyebrow}</span>
          <h2>{dict.faq.title}</h2>
          <p className="section-lead">{dict.faq.lead}</p>
        </div>

        <div className="faq-list">
          {dict.faq.items.map((faq, index) => {
            const isOpen = openIndices.includes(index);

            return (
              <div
                key={index}
                className={`faq-item ${isOpen ? "open" : ""}`}
              >
                <button
                  type="button"
                  className="faq-q"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                >
                  <span className="pr-4">{faq.q}</span>
                  <span className="shrink-0 font-extrabold text-[#1b7048]">
                    {isOpen ? (
                      <Minus className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </span>
                </button>
                <div
                  className="faq-a overflow-hidden"
                  style={{
                    maxHeight: isOpen ? "300px" : "0px",
                    paddingTop: isOpen ? "0px" : "0px",
                    paddingBottom: isOpen ? "22px" : "0px",
                    opacity: isOpen ? 1 : 0,
                    transition: "all 0.3s ease",
                  }}
                >
                  <p className="m-0">{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
