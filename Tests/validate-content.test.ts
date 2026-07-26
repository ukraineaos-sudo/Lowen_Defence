/**
 * Tests/validate-content.test.ts — Zod SiteContent + safe URLs
 */
import { describe, expect, it } from "vitest";
import {
  isSafeImageUrl,
  isSafeUrl,
  validateSiteContent,
  validateSiteContentInput,
} from "@/lib/content/validate";
import { defaultSiteContent } from "@/src/data/default-site-content";

describe("isSafeUrl", () => {
  it("allows http(s), relative, tel, mailto; blocks javascript/data", () => {
    expect(isSafeUrl("https://example.com")).toBe(true);
    expect(isSafeUrl("/path")).toBe(true);
    expect(isSafeUrl("tel:+380")).toBe(true);
    expect(isSafeUrl("mailto:a@b.c")).toBe(true);
    expect(isSafeUrl("")).toBe(true);
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeUrl("data:text/html,x")).toBe(false);
  });
});

describe("isSafeImageUrl", () => {
  it("allows https and relative; blocks data/javascript/blob/tel", () => {
    expect(isSafeImageUrl("https://cdn.example.com/a.jpg")).toBe(true);
    expect(isSafeImageUrl("/courses/a.png")).toBe(true);
    expect(isSafeImageUrl("http://cdn.example.com/a.jpg")).toBe(false);
    expect(isSafeImageUrl("data:image/png;base64,xx")).toBe(false);
    expect(isSafeImageUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeImageUrl("blob:https://x")).toBe(false);
    expect(isSafeImageUrl("tel:+380")).toBe(false);
    expect(isSafeImageUrl("")).toBe(false);
  });
});

describe("validateSiteContent", () => {
  it("accepts defaultSiteContent", () => {
    const result = validateSiteContent(defaultSiteContent);
    expect(result.ok).toBe(true);
  });

  it("rejects two featured courses", () => {
    const bad = structuredClone(defaultSiteContent);
    bad.courses[0]!.featured = true;
    bad.courses[1]!.featured = true;
    const result = validateSiteContent(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/контенту/i);
      expect(result.code).toBe("CONTENT_VALIDATION_FAILED");
      expect(result.fields.some((f) => /featured/i.test(f.message))).toBe(true);
    }
  });

  it("rejects javascript: in contacts", () => {
    const bad = structuredClone(defaultSiteContent);
    bad.contacts.websiteUrl = "javascript:void(0)";
    const result = validateSiteContent(bad);
    expect(result.ok).toBe(false);
  });

  it("rejects broken structure", () => {
    expect(validateSiteContent({ courses: [] }).ok).toBe(false);
  });

  it("rejects focal values outside 0..100", () => {
    const bad = structuredClone(defaultSiteContent);
    bad.courses[0]!.image.focalX = -1;
    expect(validateSiteContent(bad).ok).toBe(false);
    bad.courses[0]!.image.focalX = 50;
    bad.courses[0]!.image.focalY = 999;
    expect(validateSiteContent(bad).ok).toBe(false);
  });

  it("rejects duplicate course ids", () => {
    const bad = structuredClone(defaultSiteContent);
    bad.courses[1]!.id = bad.courses[0]!.id;
    const result = validateSiteContent(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fields.some((f) => /курс/i.test(f.message))).toBe(true);
    }
  });

  it("rejects duplicate team ids", () => {
    const bad = structuredClone(defaultSiteContent);
    bad.team[1]!.id = bad.team[0]!.id;
    const result = validateSiteContent(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fields.some((f) => /команд/i.test(f.message))).toBe(true);
    }
  });

  it("rejects data: and javascript: image urls", () => {
    const bad = structuredClone(defaultSiteContent);
    bad.courses[0]!.image.url = "data:image/png;base64,abc";
    expect(validateSiteContent(bad).ok).toBe(false);
    bad.courses[0]!.image.url = "javascript:alert(1)";
    expect(validateSiteContent(bad).ok).toBe(false);
  });

  it("rejects invalid email", () => {
    const bad = structuredClone(defaultSiteContent);
    bad.contacts.email = "not-an-email";
    expect(validateSiteContent(bad).ok).toBe(false);
  });

  it("rejects unknown schemaVersion", () => {
    const bad = structuredClone(defaultSiteContent) as typeof defaultSiteContent & {
      schemaVersion: number;
    };
    bad.schemaVersion = 99;
    expect(validateSiteContent(bad).ok).toBe(false);
  });

  it("rejects empty course title and team name", () => {
    const badTitle = structuredClone(defaultSiteContent);
    badTitle.courses[0]!.title = "   ";
    expect(validateSiteContent(badTitle).ok).toBe(false);

    const badName = structuredClone(defaultSiteContent);
    badName.team[0]!.name = "";
    expect(validateSiteContent(badName).ok).toBe(false);
  });

  it("rejects featured course when it is disabled", () => {
    const bad = structuredClone(defaultSiteContent);
    bad.courses[0]!.featured = true;
    bad.courses[0]!.enabled = false;
    const result = validateSiteContent(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fields.some((f) => /enabled/i.test(f.message))).toBe(true);
    }
  });
});

describe("validateSiteContentInput", () => {
  it("normalizes course and team order", () => {
    const input = structuredClone(defaultSiteContent);
    input.courses[0]!.order = 99;
    input.courses[1]!.order = 1;
    input.team[0]!.order = 50;
    const { updatedAt: _ignored, ...body } = input;
    const result = validateSiteContentInput(body);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.content.courses.map((c) => c.order)).toEqual(
        result.content.courses.map((_, i) => i + 1)
      );
      expect(result.content.team.map((t) => t.order)).toEqual(
        result.content.team.map((_, i) => i + 1)
      );
    }
  });

  it("ignores client updatedAt", () => {
    const stamped = {
      ...structuredClone(defaultSiteContent),
      updatedAt: "2000-01-01T00:00:00.000Z",
    };
    const result = validateSiteContentInput(stamped);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(
        Object.prototype.hasOwnProperty.call(result.content, "updatedAt")
      ).toBe(false);
    }
  });

  it("accepts defaultSiteContent without relying on client updatedAt", () => {
    const result = validateSiteContentInput(defaultSiteContent);
    expect(result.ok).toBe(true);
  });
});
