"use client";

import React, { useState } from "react";
import type { SiteContent } from "@/src/types/content";
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
  showAdminLink?: boolean;
};

export function PublicSite({ content, showAdminLink = true }: PublicSiteProps) {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    const el = document.querySelector("#contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div id="top" className="min-h-screen bg-white text-[#13241c] flex flex-col">
      <Header showAdminLink={showAdminLink} />

      <main className="flex-1">
        <Hero />
        <TrustStrip />
        <WhySection />
        <CoursesSection
          courses={content.courses}
          onSelectCourse={handleSelectCourse}
        />
        <MethodSection />
        <BusinessSection onSelectBusiness={() => handleSelectCourse("corporate")} />
        <StandardsSection />
        <TeamSection team={content.team} />
        <FaqSection />
        <ContactSection
          contacts={content.contacts}
          courses={content.courses}
          selectedCourseId={selectedCourseId}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
        />
      </main>

      <Footer
        contacts={content.contacts}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
