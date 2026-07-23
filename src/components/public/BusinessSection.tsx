/**
 * BusinessSection.tsx — корпоративні програми
 */
import React from "react";
import { ResponsiveImage } from "./ResponsiveImage";
import { ArrowRight, Building2, ShieldCheck, MessageSquare, Flame } from "lucide-react";

interface BusinessSectionProps {
  onSelectBusiness: () => void;
}

export const BusinessSection: React.FC<BusinessSectionProps> = ({
  onSelectBusiness,
}) => {
  const blocks = [
    {
      icon: <MessageSquare className="w-5 h-5 text-[#ffd51f] mb-2" />,
      title: "Розмова з агресивним співрозмовником",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#ffd51f] mb-2" />,
      title: "Деескалація замість конфронтації",
    },
    {
      icon: <Flame className="w-5 h-5 text-[#ffd51f] mb-2" />,
      title: "Дії при погрозі або нападі",
    },
    {
      icon: <Building2 className="w-5 h-5 text-[#ffd51f] mb-2" />,
      title: "Практичні сценарії для вашої організації",
    },
  ];

  return (
    <section className="business" id="business">
      <div className="container business-grid">
        <div>
          <span className="eyebrow" style={{ color: "#d2e6d8" }}>
            Для бізнесу та організацій
          </span>
          <h2>Corporate Awareness Training — Security</h2>
          <p
            className="section-lead"
            style={{
              width: "650px",
              maxWidth: "100%",
              fontSize: "20px",
              lineHeight: "30.512px",
              fontFamily: "Manrope, sans-serif",
              fontWeight: "bold",
              color: "#388c5a",
            }}
          >
            Працівники, які контактують з клієнтами та відвідувачами, можуть
            стикатися з образами, погрозами, агресією або нападом. Навчання поєднує
            комунікацію, деескалацію, правила поведінки у небезпеці та практичний
            самозахист.
          </p>

          <div className="business-list">
            {blocks.map((block, idx) => (
              <div key={idx} className="flex flex-col items-start justify-center p-4 rounded-2xl bg-[#0d3f2c] border border-[#1b7048]/50">
                {block.icon}
                <span className="font-bold text-sm leading-snug text-white">{block.title}</span>
              </div>
            ))}
          </div>

          <button onClick={onSelectBusiness} className="btn btn-primary">
            <span>Отримати пропозицію</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <div className="business-image">
          <ResponsiveImage
            image={{
              url: "/business/business-training.png",
              alt: "Корпоративне навчання Löwen Defence",
              focalX: 50,
              focalY: 50,
            }}
          />
        </div>
      </div>
    </section>
  );
};
