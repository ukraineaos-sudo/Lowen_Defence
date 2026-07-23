import React from "react";
import { ResponsiveImage } from "./ResponsiveImage";

export const MethodSection: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Помітити",
      desc: "Розпізнати тривожні сигнали, почути власну інтуїцію та оцінити простір.",
    },
    {
      num: "02",
      title: "Позначити кордон",
      desc: "Використати голос, дистанцію, впевнену позу та чітке «ні».",
    },
    {
      num: "03",
      title: "Вийти з ситуації",
      desc: "Знати, куди бігти, як привернути увагу та до кого звернутися.",
    },
    {
      num: "04",
      title: "Захиститися",
      desc: "Застосувати прості техніки самозахисту, адаптовані до віку й фізичних можливостей.",
    },
  ];

  return (
    <section id="approach">
      <div className="container method-grid">
        <div className="method-photo">
          <ResponsiveImage
            image={{
              url: "/method/method-practice.png",
              alt: "Практична вправа на курсі",
              focalX: 50,
              focalY: 50,
            }}
          />
          <div className="method-badge">
            Важка тема — у безпечній і підтримувальній атмосфері.
          </div>
        </div>

        <div>
          <span className="eyebrow">Методика Löwen Defence</span>
          <h2>Від усвідомлення ризику — до впевненої дії</h2>
          <p className="section-lead">
            Курс не будується навколо страху чи агресії. Учасники тренують
            послідовність дій, яку можуть пригадати в реальній ситуації.
          </p>

          <div className="steps">
            {steps.map((step) => (
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
