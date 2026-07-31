/**
 * ContactSection.tsx — контакти + форма заявки
 * POST /api/applications (honeypot/timing).
 */
"use client";

import React, { useState, useEffect } from "react";
import type { Contacts } from "../../types/content";
import type { ResolvedCourse } from "@/lib/i18n/resolve-content";
import {
  Phone,
  Mail,
  Globe,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface ContactSectionProps {
  contacts: Contacts;
  courses: ResolvedCourse[];
  selectedCourseId?: string;
  onOpenPrivacy: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  contacts,
  courses,
  selectedCourseId,
  onOpenPrivacy,
}) => {
  const { dict } = useI18n();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    courseId: "",
    comment: "",
    consent: false,
    honeypot: "",
  });
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCourseId) {
      setFormData((prev) => ({ ...prev, courseId: selectedCourseId }));
    }
  }, [selectedCourseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMsg(dict.contact.errRequired);
      return;
    }
    if (!formData.consent) {
      setErrorMsg(dict.contact.errConsent);
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
        setErrorMsg(data.error || dict.contact.errSubmit);
        if (data.code === "FORM_EXPIRED") {
          setFormStartedAt(Date.now());
        }
      }
    } catch {
      setErrorMsg(dict.contact.errNetwork);
    } finally {
      setLoading(false);
    }
  };

  const activeCourses = courses.filter((c) => c.enabled);

  return (
    <section id="contact">
      <div className="container contact-wrap">
        <div className="contact-copy">
          <span className="eyebrow" style={{ color: "#d4eadb" }}>
            {dict.contact.eyebrow}
          </span>
          <h2>{dict.contact.title}</h2>
          <p>{dict.contact.lead}</p>

          <div className="contact-details">
            <a
              href={contacts.phoneHref}
              className="flex items-center gap-3 hover:text-white transition-colors"
            >
              <Phone className="w-5 h-5 text-white" />
              <span>{contacts.phoneDisplay}</span>
            </a>
            <a
              href={`mailto:${contacts.email}`}
              className="flex items-center gap-3 hover:text-white transition-colors"
            >
              <Mail className="w-5 h-5 text-white" />
              <span>{contacts.email}</span>
            </a>
            <a
              href={contacts.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-white transition-colors"
            >
              <Globe className="w-5 h-5 text-white" />
              <span>{contacts.websiteDisplay}</span>
            </a>
          </div>
        </div>

        {/* noValidate: нативні підказки браузера (часто RU) не показуємо — свої з dict */}
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          {submitted ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <CheckCircle2 className="w-16 h-16 text-[#28aa5b] mb-4" />
              <h3 className="text-2xl font-black text-[#082d20] mb-2">
                {dict.contact.successTitle}
              </h3>
              <p className="text-[#64726a] text-sm leading-relaxed max-w-sm mb-6">
                {dict.contact.successText}
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="btn btn-dark text-sm"
              >
                {dict.contact.sendAnother}
              </button>
            </div>
          ) : (
            <div className="form-grid">
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
                  {dict.contact.name} <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={dict.contact.namePlaceholder}
                  aria-required="true"
                />
              </div>

              <div className="field">
                <label htmlFor="phone">
                  {dict.contact.phone} <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder={dict.contact.phonePlaceholder}
                  aria-required="true"
                />
              </div>

              <div className="field full">
                <label htmlFor="format">{dict.contact.courseLabel}</label>
                <select
                  id="format"
                  value={formData.courseId}
                  onChange={(e) =>
                    setFormData({ ...formData, courseId: e.target.value })
                  }
                >
                  <option value="">{dict.contact.coursePlaceholder}</option>
                  {activeCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.tag})
                    </option>
                  ))}
                  <option value="corporate">{dict.contact.corporateOption}</option>
                  <option value="custom">{dict.contact.customOption}</option>
                </select>
              </div>

              <div className="field full">
                <label htmlFor="message">{dict.contact.comment}</label>
                <textarea
                  id="message"
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  placeholder={dict.contact.commentPlaceholder}
                />
              </div>

              <div className="field full">
                <label className="consent-label flex items-start gap-2.5 cursor-pointer text-xs text-[#64726a] select-none">
                  <input
                    type="checkbox"
                    checked={formData.consent}
                    onChange={(e) =>
                      setFormData({ ...formData, consent: e.target.checked })
                    }
                    className="w-4 h-4 mt-0.5 shrink-0 rounded border-gray-300 text-[#1b7048] focus:ring-[#28aa5b] cursor-pointer"
                    aria-required="true"
                  />
                  <span>
                    {dict.contact.consentBefore}{" "}
                    <button
                      type="button"
                      onClick={onOpenPrivacy}
                      className="underline font-bold text-[#082d20] hover:text-[#28aa5b]"
                    >
                      {dict.contact.consentLink}
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
                      <span>{dict.contact.submitting}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>{dict.contact.submit}</span>
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
