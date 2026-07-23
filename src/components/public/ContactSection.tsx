/**
 * ContactSection.tsx — контакти + форма заявки
 * POST /api/applications (honeypot/timing).
 */
import React, { useState, useEffect } from "react";
import { Contacts, Course } from "../../types/content";
import { Phone, Mail, Globe, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ContactSectionProps {
  contacts: Contacts;
  courses: Course[];
  selectedCourseId?: string;
  onOpenPrivacy: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  contacts,
  courses,
  selectedCourseId,
  onOpenPrivacy,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    courseId: "",
    comment: "",
    consent: false,
    honeypot: "",
  });
  const [formStartedAt] = useState(() => Date.now());

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- 1. Preselect курсу з картки + submit заявки ---
  // Sync selected course from parent if triggered by card click
  useEffect(() => {
    if (selectedCourseId) {
      setFormData((prev) => ({ ...prev, courseId: selectedCourseId }));
    }
  }, [selectedCourseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMsg("Будь ласка, заповніть обов'язкові поля: Ім'я та Телефон.");
      return;
    }
    if (!formData.consent) {
      setErrorMsg("Будь ласка, підтвердьте згоду на обробку персональних даних.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, _t: formStartedAt }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        setFormData({
          name: "",
          phone: "",
          courseId: "",
          comment: "",
          consent: false,
          honeypot: "",
        });
      } else {
        setErrorMsg(data.error || "Не вдалося надіслати заявку. Спробуйте ще раз.");
      }
    } catch (err) {
      setErrorMsg("Не вдалося надіслати заявку. Спробуйте ще раз або зв'яжіться телефоном.");
    } finally {
      setLoading(false);
    }
  };

  const activeCourses = courses.filter((c) => c.enabled);

  return (
    <section id="contact">
      {/* --- 2. Копірайт + контакти зліва --- */}
      <div className="container contact-wrap">
        <div className="contact-copy">
          <span className="eyebrow" style={{ color: "#d4eadb" }}>
            Зв’язатися
          </span>
          <h2>Проведемо курс для вашої групи</h2>
          <p>
            Залиште заявку: допоможемо обрати формат, погодимо вік учасників,
            тривалість, місце проведення та вартість.
          </p>

          <div className="contact-details">
            <a href={contacts.phoneHref} className="flex items-center gap-3 hover:text-[#ffd51f] transition-colors">
              <Phone className="w-5 h-5 text-[#ffd51f]" />
              <span>{contacts.phoneDisplay}</span>
            </a>
            <a href={`mailto:${contacts.email}`} className="flex items-center gap-3 hover:text-[#ffd51f] transition-colors">
              <Mail className="w-5 h-5 text-[#ffd51f]" />
              <span>{contacts.email}</span>
            </a>
            <a
              href={contacts.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-[#ffd51f] transition-colors"
            >
              <Globe className="w-5 h-5 text-[#ffd51f]" />
              <span>{contacts.websiteDisplay}</span>
            </a>
          </div>
        </div>

        {/* --- 3. Форма заявки --- */}
        <form className="contact-form" onSubmit={handleSubmit}>
          {submitted ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <CheckCircle2 className="w-16 h-16 text-[#28aa5b] mb-4" />
              <h3 className="text-2xl font-black text-[#082d20] mb-2">
                Заявку отримано!
              </h3>
              <p className="text-[#64726a] text-sm leading-relaxed max-w-sm mb-6">
                Дякуємо за звернення. Ми зв’яжемося з вами найближчим часом для
                узгодження деталей проведення курсу.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="btn btn-dark text-sm"
              >
                Надіслати ще одну заявку
              </button>
            </div>
          ) : (
            <div className="form-grid">
              {/* Hidden honeypot field */}
              <input
                type="text"
                name="website_url_check"
                value={formData.honeypot}
                onChange={(e) =>
                  setFormData({ ...formData, honeypot: e.target.value })
                }
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="field">
                <label htmlFor="name">
                  Ім’я <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ваше ім’я"
                />
              </div>

              <div className="field">
                <label htmlFor="phone">
                  Телефон <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+380..."
                />
              </div>

              <div className="field full">
                <label htmlFor="format">Який курс цікавить?</label>
                <select
                  id="format"
                  value={formData.courseId}
                  onChange={(e) =>
                    setFormData({ ...formData, courseId: e.target.value })
                  }
                >
                  <option value="">-- Оберіть програму або тренінг --</option>
                  {activeCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.tag})
                    </option>
                  ))}
                  <option value="corporate">
                    Corporate Awareness Training — Security (для компаній)
                  </option>
                  <option value="custom">Індивідуальний запит / Консультація</option>
                </select>
              </div>

              <div className="field full">
                <label htmlFor="message">Коментар</label>
                <textarea
                  id="message"
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  placeholder="Місто, орієнтовна кількість учасників, бажана дата"
                />
              </div>

              <div className="field full">
                <label className="consent-label flex items-start gap-2.5 cursor-pointer text-xs text-[#64726a] select-none">
                  <input
                    type="checkbox"
                    required
                    checked={formData.consent}
                    onChange={(e) =>
                      setFormData({ ...formData, consent: e.target.checked })
                    }
                    className="w-4 h-4 mt-0.5 shrink-0 rounded border-gray-300 text-[#1b7048] focus:ring-[#28aa5b] cursor-pointer"
                  />
                  <span>
                    Я погоджуюся на обробку моїх персональних даних відповідно до{" "}
                    <button
                      type="button"
                      onClick={onOpenPrivacy}
                      className="underline font-bold text-[#082d20] hover:text-[#28aa5b]"
                    >
                      Політики конфіденційності
                    </button>
                    .
                  </span>
                </label>
              </div>

              {errorMsg && (
                <div className="field full p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="field full">
                <button
                  className="btn btn-primary w-full"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Надсилання...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>Надіслати заявку</span>
                      <Send className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
};
