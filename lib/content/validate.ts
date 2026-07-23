import { z } from "zod";
import type { SiteContent } from "@/src/types/content";

const responsiveImageSchema = z.object({
  url: z.string(),
  alt: z.string(),
  focalX: z.number(),
  focalY: z.number(),
  mobileUrl: z.string().optional(),
  mobileFocalX: z.number().optional(),
  mobileFocalY: z.number().optional(),
});

const courseSchema = z.object({
  id: z.string().min(1).max(80),
  enabled: z.boolean(),
  featured: z.boolean(),
  order: z.number(),
  tag: z.string().max(200),
  title: z.string().max(160),
  description: z.string().max(2000),
  meta: z.array(z.string().max(200)).max(8),
  price: z.string().max(200),
  priceNote: z.string().max(200),
  buttonLabel: z.string().max(200),
  image: responsiveImageSchema,
});

const teamSchema = z.object({
  id: z.string().min(1).max(80),
  enabled: z.boolean(),
  order: z.number(),
  name: z.string().max(200),
  description: z.string().max(2000),
  image: responsiveImageSchema,
});

const contactsSchema = z.object({
  phoneDisplay: z.string().max(100),
  phoneHref: z.string().max(200),
  email: z.string().max(200),
  websiteDisplay: z.string().max(200),
  websiteUrl: z.string().max(500),
  germanWebsiteUrl: z.string().max(500),
  privacyUrl: z.string().max(500),
});

export const siteContentSchema = z.object({
  schemaVersion: z.number(),
  updatedAt: z.string(),
  courses: z.array(courseSchema),
  team: z.array(teamSchema),
  contacts: contactsSchema,
});

const UNSAFE_PROTOCOLS = /^(javascript|data|vbscript):/i;

export function isSafeUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  if (UNSAFE_PROTOCOLS.test(v)) return false;
  if (v.startsWith("/") || v.startsWith("#") || v.startsWith("tel:") || v.startsWith("mailto:")) {
    return true;
  }
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateSiteContent(input: unknown): {
  ok: true;
  content: SiteContent;
} | { ok: false; error: string } {
  const parsed = siteContentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Некоректна структура даних" };
  }

  const content = parsed.data as SiteContent;
  const { contacts } = content;
  if (
    !isSafeUrl(contacts.phoneHref) ||
    !isSafeUrl(contacts.websiteUrl) ||
    !isSafeUrl(contacts.germanWebsiteUrl) ||
    !isSafeUrl(contacts.privacyUrl)
  ) {
    return { ok: false, error: "Небезпечний протокол у контактних посиланнях" };
  }

  const featured = content.courses.filter((c) => c.featured);
  if (featured.length > 1) {
    return { ok: false, error: "Лише один курс може бути виділеним (featured)" };
  }

  return { ok: true, content };
}
