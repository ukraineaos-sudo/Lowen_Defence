/**
 * Hero.tsx — головний екран лендингу
 */
import React from "react";
import { ArrowRight } from "lucide-react";

export const Hero: React.FC = () => {
  const handleScroll = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero relative overflow-hidden" id="top">
      <div className="container hero-grid relative z-10">
        <div className="hero-copy">
          <span className="eyebrow" style={{ color: "#e8f3ed" }}>
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

        <div
          className="relative mx-auto h-[550px] w-full max-w-[460px] text-center
                     filter drop-shadow-[0_22px_40px_rgba(0,0,0,0.28)]
                     sm:h-[570px]"
          aria-label="Коротко про програму"
        >
          {/*
            Shield frame.

            The silhouette is based on shield 3:4 from the selected reference:
            broad, almost vertical sides; a restrained central crest; and a
            short lower point. The lower taper starts below the text's safe
            zone, so the content remains inside both contours.
          */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 400 540"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            {/* White body and dark outer border */}
            <path
              d="
                M 22 58
                C 58 45, 95 42, 129 48
                C 157 54, 178 46, 195 32
                C 198 29, 202 29, 205 32
                C 222 46, 243 54, 271 48
                C 305 42, 342 45, 378 58
                L 378 306
                C 378 397, 328 472, 200 530
                C 72 472, 22 397, 22 306
                Z
              "
              fill="#ffffff"
              stroke="#082d20"
              strokeWidth="7"
              strokeLinejoin="round"
            />

            {/* Green inner accent with a visually even inset */}
            <path
              d="
                M 38 70
                C 68 60, 99 57, 131 62
                C 159 68, 180 61, 197 47
                C 199 45, 201 45, 203 47
                C 220 61, 241 68, 269 62
                C 301 57, 332 60, 362 70
                L 362 306
                C 362 385, 318 452, 200 511
                C 82 452, 38 385, 38 306
                Z
              "
              stroke="#04a64b"
              strokeWidth="3.5"
              strokeLinejoin="round"
              opacity="0.9"
            />
          </svg>

          {/*
            Rectangular content is deliberately limited to 76% of the shield's
            width. This is the safe area above the lower taper.
          */}
          <div
            className="relative z-10 mx-auto flex h-full w-[76%] max-w-[330px]
                       flex-col pt-[84px] sm:pt-[88px]"
          >
            <div
              className="mx-auto mb-1 grid w-[92%] grid-cols-2 gap-2.5 border-b
                         border-[#082d20]/12 pb-4 text-center sm:gap-3.5"
            >
              <div
                className="flex min-h-[92px] min-w-0 flex-col items-center
                           justify-center rounded-2xl border border-[#04a64b]/35
                           bg-[#f0f7f3] p-2.5 shadow-xs sm:p-3.5"
              >
                <b className="block text-[17px] font-black leading-tight text-[#082d20] sm:text-[19px]">
                  До 14 осіб
                </b>
                <span className="mt-1 block text-[15px] font-semibold leading-tight text-[#46574c] sm:text-[17px]">
                  у групі
                </span>
              </div>

              <div
                className="flex min-h-[92px] min-w-0 flex-col items-center
                           justify-center rounded-2xl border border-[#04a64b]/35
                           bg-[#f0f7f3] p-2.5 shadow-xs sm:p-3.5"
              >
                <b className="block text-[17px] font-black leading-tight text-[#082d20] sm:text-[19px]">
                  Практика
                </b>
                <span className="mt-1 block text-[14px] font-semibold leading-tight text-[#46574c] sm:text-[16px]">
                  сценарії й вправи
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col items-center justify-start px-1 pt-3 sm:px-3">
              <div
                className="mb-3 inline-flex min-h-[37px] min-w-[150px]
                           items-center justify-center rounded-full bg-[#e8f3ed]
                           px-4 text-[#1b7048]"
              >
                <span className="text-[16px] font-black sm:text-[17px]">
                  Вік: 5+ років
                </span>
              </div>

              <h3
                className="mb-3 max-w-[260px] text-[19px] font-extrabold
                           leading-snug text-[#082d20] sm:text-[20px]"
              >
                Навички безпеки з дитинства
              </h3>

              <p
                className="mx-auto mb-0 max-w-[270px] text-[15px] leading-[1.62]
                           text-[#64726a] sm:max-w-[290px] sm:text-[16px]"
              >
                Навчаємо розпізнавати ризики, діяти впевнено, звертатися по
                допомогу та захищати себе у зрозумілій і доброзичливій
                <span className="block">формі.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};