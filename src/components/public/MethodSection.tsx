/**
 * MethodSection.tsx — методика навчання
 */
"use client";

import React from "react";
import { ResponsiveImage } from "./ResponsiveImage";
import { useI18n } from "@/lib/i18n/I18nProvider";

export const MethodSection: React.FC = () => {
  const { dict } = useI18n();

  return (
    <section id="approach">
      <div className="container method-grid">
        <div className="method-photo">
          <ResponsiveImage
            image={{
              url: "/method/method-practice.png",
              alt: dict.method.imageAlt,
              focalX: 50,
              focalY: 50,
            }}
          />
          <div className="method-badge">{dict.method.badge}</div>
        </div>

        <div>
          <span className="eyebrow">{dict.method.eyebrow}</span>
          <h2>{dict.method.title}</h2>
          <p className="section-lead">{dict.method.lead}</p>

          <div className="steps">
            {dict.method.steps.map((step) => (
              <div key={step.num} className="step">
                <div className="step-num">{step.num}</div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#082d20] mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#64726a] m-0">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
