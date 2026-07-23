/**
 * Hero.tsx — головний екран лендингу
 */
import React from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

export const Hero: React.FC = () => {
  const handleScroll = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero relative overflow-hidden" id="top">
      {/* 3 Yellow diagonal decorative stripes behind shield (slanted bottom-left to top-right) */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-[700px] pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute right-[10%] top-1/2 -translate-y-1/2 flex gap-7 sm:gap-10"
          style={{ 
            transform: "rotate(35deg)", 
            transformOrigin: "center center" 
          }}
        >
          <div className="w-12 sm:w-16 h-[1200px] bg-[#ffd51f]" />
          <div className="w-12 sm:w-16 h-[1200px] bg-[#ffd51f]" />
          <div className="w-12 sm:w-16 h-[1200px] bg-[#ffd51f]" />
        </div>
      </div>

      <div className="container hero-grid relative z-10">
        <div className="hero-copy">
          <span className="eyebrow" style={{ color: "#a9cdb8" }}>
            Німецька методика · українська команда
          </span>
          <h1>
            Створюємо обізнаність, <span>не викликаючи страху</span>
          </h1>
          <p className="lead">
            Практичні курси безпечної поведінки, впевненості, деескалації та самозахисту
            для дітей, підлітків, жінок, батьків, закладів освіти й компаній.
          </p>
          <div className="hero-actions">
            <button
              onClick={() => handleScroll("#courses")}
              className="btn btn-primary"
            >
              <span>Обрати курс</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              onClick={() => handleScroll("#contact")}
              className="btn btn-secondary"
            >
              Запросити тренінг
            </button>
          </div>
        </div>

        <div className="relative w-full max-w-[480px] mx-auto min-h-[530px] flex flex-col justify-between p-7 sm:p-9 text-center filter drop-shadow-[0_22px_40px_rgba(0,0,0,0.4)]" aria-label="Коротко про програму">
          {/* SVG Shield Frame (English Shield / English écu with wider bottom) */}
          <svg 
            className="absolute inset-0 w-full h-full text-white pointer-events-none" 
            viewBox="0 0 400 500" 
            preserveAspectRatio="none" 
            fill="none"
          >
            {/* Fill & Outer Border */}
            <path 
              d="M 200,28 C 260,8 330,8 384,22 C 388,180 380,310 330,398 C 280,470 230,488 200,492 C 170,488 120,470 70,398 C 20,310 12,180 16,22 C 70,8 140,8 200,28 Z" 
              fill="#ffffff" 
              stroke="#082d20" 
              strokeWidth="7" 
              strokeLinejoin="round" 
            />
            {/* Inner Accent Line */}
            <path 
              d="M 200,42 C 255,24 318,24 370,36 C 374,180 366,298 320,380 C 274,450 226,470 200,474 C 174,470 126,450 80,380 C 34,298 26,180 30,36 C 82,24 145,24 200,42 Z" 
              fill="none" 
              stroke="#28aa5b" 
              strokeWidth="3.5" 
              strokeLinejoin="round"
              opacity="0.9"
            />
          </svg>

          {/* Content layered over the shield */}
          <div className="relative z-10 pt-5 px-3.5 sm:px-4 flex flex-col h-full">
            {/* Top Row: Left (Group size) & Right (Practice) with enlarged text and adjusted margins */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 text-center pb-4 mb-2 border-b border-[#082d20]/12">
              <div className="-ml-3 flex flex-col justify-center items-center bg-[#f0f7f3] p-3 sm:p-3.5 rounded-2xl border border-[#28aa5b]/35 shadow-xs">
                <b className="text-[19px] w-[125px] font-black text-[#082d20] block leading-tight">До 14 осіб</b>
                <span className="text-[17px] w-[125px] text-[#46574c] font-semibold leading-tight block mt-1">у групі</span>
              </div>

              <div className="-mr-3 flex flex-col justify-center items-center bg-[#f0f7f3] p-3 sm:p-3.5 rounded-2xl border border-[#28aa5b]/35 shadow-xs">
                <b className="text-[19px] w-[125px] font-black text-[#082d20] block leading-tight">Практика</b>
                <span className="text-[16px] w-[125px] text-[#46574c] font-semibold leading-tight block mt-1">сценарії й вправи</span>
              </div>
            </div>

            {/* Below Center: Remaining Content */}
            <div className="flex-1 flex flex-col items-center justify-start pt-3 px-4">
              <div className="-mt-3 w-[150px] inline-flex items-center justify-center pl-4 pt-[5px] pb-[6px] rounded-full bg-[#e8f3ed] text-[#1b7048] font-black mb-2">
                <span className="text-[17px] pr-[15px]">Вік: 5+ років</span>
              </div>

              <h3 className="font-extrabold text-[20px] text-[#082d20] mb-2 leading-snug">
                Навички безпеки з дитинства
              </h3>

              <p className="text-[17px] leading-relaxed text-[#64726a] max-w-[310px] mx-auto pb-[40px] mb-0">
                Навчаємо розпізнавати ризики, діяти впевнено, звертатися по допомогу та
                захищати себе у зрозумілій і доброзичливій формі.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
