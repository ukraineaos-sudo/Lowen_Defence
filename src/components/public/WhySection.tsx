/**
 * WhySection.tsx — блок «Чому ми»
 */
"use client";

import React from "react";
import { ResponsiveImage } from "./ResponsiveImage";
import { useI18n } from "@/lib/i18n/I18nProvider";

export const WhySection: React.FC = () => {
  const { dict } = useI18n();

  return (
    <section id="why">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">{dict.why.eyebrow}</span>
            <h2>{dict.why.title}</h2>
          </div>
          <p className="section-lead">{dict.why.lead}</p>
        </div>

        <div className="why-grid">
          <div className="why-image">
            <ResponsiveImage
              image={{
                url: "/why/why-practice.jpg",
                alt: dict.why.imageAlt,
                focalX: 50,
                focalY: 50,
              }}
            />
            <div className="why-quote">{dict.why.quote}</div>
          </div>

          <div className="risk-grid">
            {dict.why.risks.map((risk, index) => (
              <article key={index} className="risk">
                <h3>{risk.title}</h3>
                <p>{risk.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
