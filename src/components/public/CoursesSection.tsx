/**
 * CoursesSection.tsx — каталог курсів
 */
import React from "react";
import { Course } from "../../types/content";
import { ResponsiveImage } from "./ResponsiveImage";
import { Check, Sparkles } from "lucide-react";

interface CoursesSectionProps {
  courses: Course[];
  onSelectCourse: (courseId: string, courseTitle: string) => void;
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({
  courses,
  onSelectCourse,
}) => {
  const activeCourses = courses
    .filter((c) => c.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <section className="courses" id="courses">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Програми</span>
            <h2>Курси для різних ситуацій і віку</h2>
          </div>
          <p className="section-lead">
            Оберіть готовий формат або замовте індивідуальну програму для школи,
            громади чи організації.
          </p>
        </div>

        <div className="course-grid">
          {activeCourses.map((course, index) => {
            const isFeatured = course.featured || index === 0;

            return (
              <article
                key={course.id}
                className={`course-card ${isFeatured ? "featured" : ""}`}
              >
                <div className="course-image">
                  <ResponsiveImage image={course.image} />
                  {course.tag && <span className="tag">{course.tag}</span>}
                </div>

                <div className="course-body">
                  <div className="mb-2">
                    <h3 className={`font-extrabold text-xl leading-snug ${isFeatured ? "text-white" : "text-[#082d20]"}`}>
                      {course.title}
                    </h3>
                  </div>

                  <p className={`text-sm leading-relaxed mb-4 ${isFeatured ? "text-[#cbe0d3]" : "text-[#64726a]"}`}>
                    {course.description}
                  </p>

                  {course.meta && course.meta.length > 0 && (
                    <div className="meta">
                      {course.meta.map((m, idx) => (
                        <span key={idx}>{m}</span>
                      ))}
                    </div>
                  )}

                  <div className="price">
                    <div>
                      <strong className={isFeatured ? "text-[#ffd51f]" : "text-[#082d20]"}>
                        {course.price}
                      </strong>
                      {course.priceNote && (
                        <small className={`block text-xs mt-0.5 ${isFeatured ? "text-[#a9cdb8]" : "text-[#64726a]"}`}>
                          {course.priceNote}
                        </small>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectCourse(course.id, course.title)}
                      className={`btn ${isFeatured ? "btn-primary" : "btn-dark"}`}
                    >
                      {course.buttonLabel || "Записатися"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="discount-note flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-[#4e4300] shrink-0" />
            <span>Пакетна пропозиція: від трьох тренінгів — знижка 10%.</span>
          </div>
          <button
            onClick={() =>
              onSelectCourse("package-deal", "Пакетна пропозиція (від 3 тренінгів)")
            }
            className="text-xs font-black uppercase tracking-wider underline hover:opacity-80"
          >
            Дізнатися деталі →
          </button>
        </div>
      </div>
    </section>
  );
};
