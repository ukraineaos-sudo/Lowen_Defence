/**
 * StandardsSection.tsx — стандарти / сертифікації
 */
import React from "react";

export const StandardsSection: React.FC = () => {
  const standards = [
    {
      num: "01",
      title: "Навчання методиці",
      desc: "Кожен тренер проходить підготовку Löwen Defence.",
    },
    {
      num: "02",
      title: "Бездоганна репутація",
      desc: "До роботи допускаються лише перевірені фахівці.",
    },
    {
      num: "03",
      title: "Досвід з дітьми",
      desc: "Важливі не лише техніки, а й педагогічна взаємодія.",
    },
    {
      num: "04",
      title: "Постійний розвиток",
      desc: "Тренери регулярно вдосконалюють навички й методику.",
    },
  ];

  return (
    <section>
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Стандарти тренерів</span>
            <h2>Довіра починається з якості підготовки</h2>
          </div>
          <p className="section-lead">
            Фелікс Тимченко особисто бере участь у підготовці тренерського складу,
            щоб забезпечити єдині стандарти, практичність і безпечну взаємодію з
            учасниками.
          </p>
        </div>

        <div className="standards-grid">
          {standards.map((s) => (
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
