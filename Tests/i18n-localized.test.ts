/**
 * Tests/i18n-localized.test.ts — LocalizedText resolve + dual-shape validation
 */
import { describe, expect, it } from "vitest";
import {
  localizedUk,
  resolveLocalized,
  withLocalizedUk,
} from "@/lib/i18n/localized";
import { resolveSiteContent } from "@/lib/i18n/resolve-content";
import { validateSiteContent } from "@/lib/content/validate";
import { defaultSiteContent } from "@/src/data/default-site-content";

describe("localized helpers", () => {
  it("resolves plain string as uk for any locale", () => {
    expect(resolveLocalized("Привіт", "uk")).toBe("Привіт");
    expect(resolveLocalized("Привіт", "en")).toBe("Привіт");
  });

  it("prefers en when present, else falls back to uk", () => {
    const dual = { uk: "Курс", en: "Course" };
    expect(resolveLocalized(dual, "en")).toBe("Course");
    expect(resolveLocalized(dual, "uk")).toBe("Курс");
    expect(resolveLocalized({ uk: "Курс" }, "en")).toBe("Курс");
  });

  it("withLocalizedUk preserves en when editing uk", () => {
    const next = withLocalizedUk({ uk: "Стара", en: "Old" }, "Нова");
    expect(next).toEqual({ uk: "Нова", en: "Old" });
    expect(withLocalizedUk("Лише uk", "Нова")).toBe("Нова");
  });

  it("localizedUk reads canonical text", () => {
    expect(localizedUk("A")).toBe("A");
    expect(localizedUk({ uk: "B", en: "C" })).toBe("B");
  });
});

describe("CMS bilingual content", () => {
  it("accepts defaultSiteContent with dual-shape fields", () => {
    expect(validateSiteContent(defaultSiteContent).ok).toBe(true);
  });

  it("accepts legacy plain-string course fields", () => {
    const legacy = structuredClone(defaultSiteContent);
    legacy.courses[0]!.title = "Plain UA title";
    legacy.courses[0]!.tag = "5–7";
    legacy.courses[0]!.description = "Desc";
    legacy.courses[0]!.meta = ["a", "b"];
    legacy.courses[0]!.price = "100";
    legacy.courses[0]!.priceNote = "note";
    legacy.courses[0]!.buttonLabel = "Go";
    legacy.courses[0]!.image.alt = "Alt";
    expect(validateSiteContent(legacy).ok).toBe(true);
  });

  it("resolveSiteContent uses en for courses when available", () => {
    const resolved = resolveSiteContent(defaultSiteContent, "en");
    const first = resolved.courses.find((c) => c.id === "course-1");
    expect(first?.title).toBe("First self-defence skills");
    expect(first?.tag).toBe("Ages 5–7");
  });

  it("resolveSiteContent uses default EN when stored dual has uk only (same course id)", () => {
    const content = structuredClone(defaultSiteContent);
    content.courses[0]!.title = { uk: "Лише українською" };
    const resolved = resolveSiteContent(content, "en");
    // course-1 є в default seed з EN — публічний EN береться звідти
    expect(resolved.courses[0]!.title).toBe("First self-defence skills");
  });

  it("resolveSiteContent falls back to uk when no en in stored or default", () => {
    const content = structuredClone(defaultSiteContent);
    content.courses[0] = {
      ...content.courses[0]!,
      id: "course-unknown-no-default-en",
      title: { uk: "Лише українською" },
    };
    const resolved = resolveSiteContent(content, "en");
    expect(resolved.courses[0]!.title).toBe("Лише українською");
  });
});
