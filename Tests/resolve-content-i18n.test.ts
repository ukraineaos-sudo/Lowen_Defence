/**
 * resolve-content.test.ts — EN з default, якщо в Blob лише plain uk
 */
import { describe, expect, it } from "vitest";
import { resolveSiteContent } from "@/lib/i18n/resolve-content";
import type { SiteContent } from "@/src/types/content";

const blobLikeUkOnly: SiteContent = {
  schemaVersion: 1,
  updatedAt: "2026-07-22T12:00:00.000Z",
  courses: [
    {
      id: "course-1",
      enabled: true,
      featured: true,
      order: 1,
      tag: "5–7 років",
      title: "Перші навички самозахисту",
      description: "UA only",
      meta: ["до 14 дітей"],
      price: "850 грн",
      priceNote: "за учасника",
      buttonLabel: "Записатися",
      image: {
        url: "/courses/course-5-7.png",
        alt: "Курс",
        focalX: 50,
        focalY: 50,
      },
    },
  ],
  team: [],
  contacts: {
    phoneDisplay: "+380",
    phoneHref: "tel:+380",
    email: "a@b.c",
    websiteDisplay: "esosh.net",
    websiteUrl: "https://www.esosh.net",
    germanWebsiteUrl: "https://example.com",
    privacyUrl: "/",
  },
};

describe("resolveSiteContent EN fallback from default", () => {
  it("uses default EN title when Blob has plain uk string", () => {
    const resolved = resolveSiteContent(blobLikeUkOnly, "en");
    expect(resolved.courses[0].title).toBe("First self-defence skills");
    expect(resolved.courses[0].tag).toBe("Ages 5–7");
  });

  it("keeps uk for uk locale", () => {
    const resolved = resolveSiteContent(blobLikeUkOnly, "uk");
    expect(resolved.courses[0].title).toBe("Перші навички самозахисту");
  });
});
