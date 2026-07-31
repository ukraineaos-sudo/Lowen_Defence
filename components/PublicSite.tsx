/**
 * PublicSite.tsx — збірка публічного лендингу з контенту + i18n
 */
"use client";

import React, { useMemo, useState } from "react";
import type { SiteContent } from "@/src/types/content";
import { I18nProvider, useI18n } from "@/lib/i18n/I18nProvider";
import { resolveSiteContent } from "@/lib/i18n/resolve-content";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";
import { Header } from "@/src/components/public/Header";
import { Hero } from "@/src/components/public/Hero";
import { TrustStrip } from "@/src/components/public/TrustStrip";
import { WhySection } from "@/src/components/public/WhySection";
import { CoursesSection } from "@/src/components/public/CoursesSection";
import { MethodSection } from "@/src/components/public/MethodSection";
import { BusinessSection } from "@/src/components/public/BusinessSection";
import { StandardsSection } from "@/src/components/public/StandardsSection";
import { TeamSection } from "@/src/components/public/TeamSection";
import { FaqSection } from "@/src/components/public/FaqSection";
import { ContactSection } from "@/src/components/public/ContactSection";
import { Footer } from "@/src/components/public/Footer";
import { PrivacyModal } from "@/src/components/public/PrivacyModal";

type PublicSiteProps = {
  content: SiteContent;
  locale?: Locale;
  showAdminLink?: boolean;
};

/** Внутрішня розмітка з резолвом CMS-текстів під поточну локаль. */
function PublicSiteBody({
  content,
  showAdminLink,
}: {
  content: SiteContent;
  showAdminLink: boolean;
}) {
  const { locale } = useI18n();
  const resolved = useMemo(
    () => resolveSiteContent(content, locale),
    [content, locale]
  );

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // --- 1. Клік по курсу → скрол до #contact з preselect ---
  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    const el = document.querySelector("#contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* --- 2. Розмітка секцій лендингу --- */}
      <div id="top" className="min-h-screen bg-white text-[#13241c] flex flex-col">
        <Header
          showAdminLink={showAdminLink}
          germanWebsiteUrl={resolved.contacts.germanWebsiteUrl}
        />

        <main className="flex-1">
          <Hero />
          <TrustStrip />
          <WhySection />
          <CoursesSection
            courses={resolved.courses}
            onSelectCourse={handleSelectCourse}
          />
          <MethodSection />
          <BusinessSection onSelectBusiness={() => handleSelectCourse("corporate")} />
          <StandardsSection />
          <TeamSection team={resolved.team} />
          <FaqSection />
          <ContactSection
            contacts={resolved.contacts}
            courses={resolved.courses}
            selectedCourseId={selectedCourseId}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
          />
        </main>

        <Footer
          contacts={resolved.contacts}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
        />

        <PrivacyModal
          isOpen={isPrivacyOpen}
          onClose={() => setIsPrivacyOpen(false)}
        />
      </div>
    </>
  );
}

export function PublicSite({
  content,
  locale = DEFAULT_LOCALE,
  showAdminLink = true,
}: PublicSiteProps) {
  return (
    <I18nProvider initialLocale={locale}>
      <PublicSiteBody content={content} showAdminLink={showAdminLink} />
    </I18nProvider>
  );
}
