/**
 * StandardsSection.tsx — стандарти / сертифікації
 */
"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export const StandardsSection: React.FC = () => {
  const { dict } = useI18n();

  return (
    <section className="standards-section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">{dict.standards.eyebrow}</span>
            <h2>{dict.standards.title}</h2>
          </div>
          <p className="section-lead">{dict.standards.lead}</p>
        </div>

        <div className="standards-grid">
          {dict.standards.items.map((s) => (
            <article key={s.num} className="standard">
              <b>{s.num}</b>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
