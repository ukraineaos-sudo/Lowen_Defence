/**
 * WhySection.tsx — блок «Чому ми»
 */
import React from "react";
import { ResponsiveImage } from "./ResponsiveImage";

export const WhySection: React.FC = () => {
  const risks = [
    {
      title: "Булінг і тиск",
      desc: "Впевнена постава, голос, кордони та алгоритм звернення по допомогу.",
    },
    {
      title: "Небезпечний контакт",
      desc: "Дистанція, оцінка ситуації, відмова, привернення уваги та безпечний вихід.",
    },
    {
      title: "Переслідування",
      desc: "Куди бігти, кому повідомити, як діяти у публічному просторі.",
    },
    {
      title: "Напад",
      desc: "Прості й ефективні техніки самозахисту лише тоді, коли уникнути небезпеки не вдалося.",
    },
  ];

  return (
    <section id="why">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Навіщо це потрібно</span>
            <h2>Безпечна поведінка — навичка, яку можна тренувати</h2>
          </div>
          <p className="section-lead">
            Небезпечні ситуації можуть виникати в школі, громадському транспорті,
            дорогою додому, у клубі, дитячому таборі або на майданчику.
            Підготовка допомагає не завмерти, а обрати правильну дію.
          </p>
        </div>

        <div className="why-grid">
          <div className="why-image">
            <ResponsiveImage
              image={{
                url: "/why/why-practice.png",
                alt: "Практичне заняття для дітей",
                focalX: 50,
                focalY: 50,
              }}
            />
            <div className="why-quote">
              Мета курсу — щоб дитина пішла додому сильнішою, впевненішою та в
              гарному настрої.
            </div>
          </div>

          <div className="risk-grid">
            {risks.map((risk, index) => (
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
