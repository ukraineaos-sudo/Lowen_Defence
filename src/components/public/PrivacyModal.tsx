/**
 * PrivacyModal.tsx — модалка політики конфіденційності
 */
import React from "react";
import { X, ShieldCheck } from "lucide-react";
import {
  SITE_PRIVACY_URL,
  privacyPolicyMeta,
  privacyPolicySections,
} from "../../data/privacy-policy";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[#dbe5dd]">
        <div className="px-6 py-5 bg-[#082d20] text-white flex items-center justify-between border-b border-[#13563a] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <ShieldCheck className="w-6 h-6 text-[#082d20] shrink-0" />
            <h3 className="text-lg font-black tracking-wide text-white m-0 truncate">
              Політика конфіденційності
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors shrink-0"
            aria-label="Закрити"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-sm text-[#13241c] leading-relaxed">
          <div className="space-y-2">
            <p className="font-extrabold text-[#082d20] text-base m-0">
              {privacyPolicyMeta.title}
            </p>
            <p className="text-xs text-[#64726a] m-0">
              Вебсайт{" "}
              <a
                href={SITE_PRIVACY_URL}
                className="text-[#1b7048] font-bold underline break-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                {SITE_PRIVACY_URL}
              </a>
            </p>
            <p className="text-xs text-[#64726a] m-0">
              Дата набрання чинності: {privacyPolicyMeta.effectiveDate}
            </p>
          </div>

          <p className="font-extrabold text-[#082d20] m-0">
            {privacyPolicyMeta.brandLine}
          </p>

          <p className="m-0">
            Ця Політика конфіденційності та захисту персональних даних (далі —
            «Політика») визначає порядок збору, обробки, зберігання та захисту
            персональних даних користувачів вебсайту{" "}
            <a
              href={SITE_PRIVACY_URL}
              className="text-[#1b7048] font-bold underline break-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              {SITE_PRIVACY_URL}
            </a>{" "}
            (далі — «Сайт»).
          </p>

          <p className="m-0">
            Політика розроблена відповідно до Закону України «Про захист
            персональних даних» № 2297-VI, інших нормативно-правових актів
            України, а також з урахуванням загальних принципів європейського
            регулювання захисту даних (GDPR).
          </p>

          {privacyPolicySections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h4 className="font-extrabold text-[#0d3f2c] pt-1 m-0">
                {section.title}
              </h4>
              {section.paragraphs?.map((p, i) => (
                <p key={`${section.title}-p-${i}`} className="m-0">
                  {p}
                </p>
              ))}
              {section.bullets && section.bullets.length > 0 && (
                <ul className="list-disc pl-5 space-y-1.5 m-0">
                  {section.bullets.map((item, i) => (
                    <li key={`${section.title}-b-${i}`}>{item}</li>
                  ))}
                </ul>
              )}
              {section.note && (
                <p className="m-0 italic text-[#64726a]">{section.note}</p>
              )}
            </section>
          ))}
        </div>

        <div className="p-4 bg-[#f7f3e9] border-t border-[#dbe5dd] flex justify-end shrink-0">
          <button onClick={onClose} className="btn btn-dark text-sm py-2 px-6">
            Зрозуміло
          </button>
        </div>
      </div>
    </div>
  );
};
