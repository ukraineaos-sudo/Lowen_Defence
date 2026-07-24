/**
 * Tests/validate-content.test.ts — Zod SiteContent + safe URLs
 */
import { describe, expect, it } from "vitest";
import { isSafeUrl, validateSiteContent } from "@/lib/content/validate";
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
      expect(result.error).toMatch(/featured/i);
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
});
