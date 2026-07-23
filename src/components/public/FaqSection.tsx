import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

export const FaqSection: React.FC = () => {
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const faqs = [
    {
      q: "Чи не налякає курс дитину?",
      a: "Ні. Методика спеціально побудована так, щоб створювати обізнаність без залякування. Є місце для гумору, руху та позитивних емоцій.",
    },
    {
      q: "Чи навчаєте ви дітей битися?",
      a: "Основний акцент — на розпізнаванні ризику, комунікації, дистанції, деескалації та виході з небезпечної ситуації. Самозахист — лише одна з частин програми.",
    },
    {
      q: "Чи можна запросити тренерів до школи або компанії?",
      a: "Так. Команда проводить виїзні курси та адаптує сценарії до потреб закладу, громади чи підприємства.",
    },
    {
      q: "Що отримують учасники після курсу?",
      a: "Кожен учасник отримує сертифікат, а головне — практичні алгоритми й досвід безпечного реагування.",
    },
  ];

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
          <span className="eyebrow">Поширені питання</span>
          <h2>Перед записом на курс</h2>
          <p className="section-lead">
            Формат можна адаптувати до віку, групи, місця проведення та запиту
            організації.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => {
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
                    {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
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
