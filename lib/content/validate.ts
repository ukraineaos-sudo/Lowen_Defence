/**
 * lib/content/validate.ts — Zod-валідація SiteContent
 * Input (save) vs stored (read); безпечні URL; інваріанти featured/ID.
 */
import { z } from "zod";
import type { SiteContent } from "@/src/types/content";

export type ValidationFieldIssue = { path: string; message: string };

export type ValidateOk<T> = { ok: true; content: T };
export type ValidateFail = {
  ok: false;
  error: string;
  code: "CONTENT_VALIDATION_FAILED";
  fields: ValidationFieldIssue[];
};

type SiteContentInput = Omit<SiteContent, "updatedAt">;

const MAX_LIST = 100;
const MAX_FIELDS = 10;

const UNSAFE_PROTOCOLS = /^(javascript|data|vbscript|file|blob):/i;

/** Загальні посилання (tel/mailto/http/https/relative). Не для image.url. */
export function isSafeUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  if (UNSAFE_PROTOCOLS.test(v)) return false;
  if (
    v.startsWith("/") ||
    v.startsWith("#") ||
    v.startsWith("tel:") ||
    v.startsWith("mailto:")
  ) {
    return !v.startsWith("//");
  }
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Постійний URL зображення: https або відносний шлях `/...`. */
export function isSafeImageUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (UNSAFE_PROTOCOLS.test(v)) return false;
  if (v.startsWith("//")) return false;
  if (v.startsWith("/")) return true;
  try {
    const u = new URL(v);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Лише tel: з цифрами. */
export function isSafePhoneHref(value: string): boolean {
  const v = value.trim();
  if (!/^tel:/i.test(v)) return false;
  const rest = v.slice(v.indexOf(":") + 1);
  return /^\+?[\d\s().\-]+$/.test(rest) && /\d/.test(rest);
}

/** Зовнішні сайти: лише https. */
export function isSafeWebUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Сторінка privacy: https або відносний `/...`. */
export function isSafePageUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (UNSAFE_PROTOCOLS.test(v)) return false;
  if (v.startsWith("//")) return false;
  if (v.startsWith("/")) return true;
  try {
    const u = new URL(v);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    else seen.add(value);
  }
  return [...duplicates];
}

function optionalImageUrl() {
  return z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z
      .string()
      .trim()
      .max(1000)
      .refine(isSafeImageUrl, "Некоректний URL зображення")
      .optional()
  );
}

const focalSchema = z
  .number()
  .finite()
  .min(0, "Має бути від 0 до 100")
  .max(100, "Має бути від 0 до 100");

const imageUrlSchema = z
  .string()
  .trim()
  .max(1000)
  .refine(isSafeImageUrl, "Некоректний URL зображення");

/**
 * CMS-текст: plain string (uk) або { uk, en? }.
 * Старий JSON без en валідний; порожній en відкидаємо на optional.
 */
function localizedTextSchema(max: number, min = 1) {
  const plain = z.string().trim().min(min).max(max);
  const dual = z.object({
    uk: z.string().trim().min(min).max(max),
    en: z
      .string()
      .trim()
      .max(max)
      .optional()
      .transform((v) => (v && v.length > 0 ? v : undefined)),
  });
  return z.union([plain, dual]);
}

/** Як localizedTextSchema, але допускає порожній uk/string (price / priceNote). */
function localizedTextOptionalSchema(max: number) {
  const plain = z.string().trim().max(max);
  const dual = z.object({
    uk: z.string().trim().max(max),
    en: z
      .string()
      .trim()
      .max(max)
      .optional()
      .transform((v) => (v && v.length > 0 ? v : undefined)),
  });
  return z.union([plain, dual]);
}

const responsiveImageSchema = z.object({
  url: imageUrlSchema,
  alt: localizedTextSchema(300),
  focalX: focalSchema,
  focalY: focalSchema,
  mobileUrl: optionalImageUrl(),
  mobileFocalX: focalSchema.optional(),
  mobileFocalY: focalSchema.optional(),
});

const courseSchema = z.object({
  id: z.string().trim().min(1).max(80),
  enabled: z.boolean(),
  featured: z.boolean(),
  order: z.number().int().positive(),
  tag: localizedTextSchema(200),
  title: localizedTextSchema(160),
  description: localizedTextSchema(2000),
  meta: z.array(localizedTextSchema(200)).max(8),
  price: localizedTextOptionalSchema(200),
  priceNote: localizedTextOptionalSchema(200),
  buttonLabel: localizedTextSchema(200),
  image: responsiveImageSchema,
});

const teamSchema = z.object({
  id: z.string().trim().min(1).max(80),
  enabled: z.boolean(),
  order: z.number().int().positive(),
  name: localizedTextSchema(200),
  description: localizedTextSchema(2000),
  image: responsiveImageSchema,
});
const contactsSchema = z.object({
  phoneDisplay: z.string().trim().min(1).max(100),
  phoneHref: z
    .string()
    .trim()
    .max(200)
    .refine(isSafePhoneHref, "Телефон має бути у форматі tel:+380..."),
  email: z.string().trim().email().max(200),
  websiteDisplay: z.string().trim().max(200),
  websiteUrl: z
    .string()
    .trim()
    .max(500)
    .refine(isSafeWebUrl, "websiteUrl має бути https://..."),
  germanWebsiteUrl: z
    .string()
    .trim()
    .max(500)
    .refine(isSafeWebUrl, "germanWebsiteUrl має бути https://..."),
  privacyUrl: z
    .string()
    .trim()
    .max(500)
    .refine(isSafePageUrl, "privacyUrl: https або відносний шлях"),
});

function applyContentInvariants(
  data: {
    courses: z.infer<typeof courseSchema>[];
    team: z.infer<typeof teamSchema>[];
  },
  ctx: z.RefinementCtx
) {
  const courseDupes = findDuplicates(data.courses.map((c) => c.id));
  if (courseDupes.length > 0) {
    ctx.addIssue({
      code: "custom",
      path: ["courses"],
      message: `Дубльовані ID курсів: ${courseDupes.join(", ")}`,
    });
  }

  const teamDupes = findDuplicates(data.team.map((t) => t.id));
  if (teamDupes.length > 0) {
    ctx.addIssue({
      code: "custom",
      path: ["team"],
      message: `Дубльовані ID команди: ${teamDupes.join(", ")}`,
    });
  }

  const featured = data.courses.filter((c) => c.featured);
  if (featured.length > 1) {
    ctx.addIssue({
      code: "custom",
      path: ["courses"],
      message: "Лише один курс може бути виділеним (featured)",
    });
  }
  for (const course of featured) {
    if (!course.enabled) {
      ctx.addIssue({
        code: "custom",
        path: ["courses"],
        message: "Featured-курс має бути увімкненим (enabled)",
      });
      break;
    }
  }
}

const siteContentBodySchema = z
  .object({
    schemaVersion: z.literal(1),
    courses: z.array(courseSchema).max(MAX_LIST),
    team: z.array(teamSchema).max(MAX_LIST),
    contacts: contactsSchema,
  })
  .superRefine(applyContentInvariants);

/** Payload збереження: без довіри до client updatedAt. */
export const siteContentInputSchema = siteContentBodySchema;

/** Збережений JSON зі сховища. */
export const siteContentStoredSchema = siteContentBodySchema.safeExtend({
  updatedAt: z.string().datetime({ offset: true }),
});

/** @deprecated alias — stored schema для сумісності імпортів. */
export const siteContentSchema = siteContentStoredSchema;

/** POST /api/admin/content — OCC envelope. */
export const saveContentRequestSchema = z.object({
  expectedRevision: z.string().min(1).nullable(),
  content: z.unknown(),
});

export function parseSaveContentRequest(input: unknown):
  | {
      ok: true;
      expectedRevision: string | null;
      content: unknown;
    }
  | { ok: false; error: string } {
  const parsed = saveContentRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Некоректний формат запиту збереження" };
  }
  return {
    ok: true,
    expectedRevision: parsed.data.expectedRevision,
    content: parsed.data.content,
  };
}

function issuesToFields(error: z.ZodError): ValidationFieldIssue[] {
  return error.issues.slice(0, MAX_FIELDS).map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

function failFromZod(error: z.ZodError): ValidateFail {
  const fields = issuesToFields(error);
  console.warn("SiteContent validation failed", {
    issues: error.issues.map((issue) => ({
      path: issue.path.join("."),
      code: issue.code,
      message: issue.message,
    })),
  });
  return {
    ok: false,
    error: "Некоректні дані контенту",
    code: "CONTENT_VALIDATION_FAILED",
    fields,
  };
}

function normalizeOrders<T extends { order: number }>(items: T[]): T[] {
  return items.map((item, index) => ({ ...item, order: index + 1 }));
}

/** Валідація + нормалізація order перед записом (updatedAt ставить сервер). */
export function validateSiteContentInput(
  input: unknown
): ValidateOk<SiteContentInput> | ValidateFail {
  const parsed = siteContentInputSchema.safeParse(input);
  if (!parsed.success) return failFromZod(parsed.error);

  const content: SiteContentInput = {
    schemaVersion: parsed.data.schemaVersion,
    courses: normalizeOrders(parsed.data.courses),
    team: normalizeOrders(parsed.data.team),
    contacts: parsed.data.contacts,
  };
  return { ok: true, content };
}

/** Повна валідація збереженого SiteContent (read / restore). */
export function validateSiteContent(
  input: unknown
): ValidateOk<SiteContent> | ValidateFail {
  const parsed = siteContentStoredSchema.safeParse(input);
  if (!parsed.success) return failFromZod(parsed.error);

  const content: SiteContent = {
    schemaVersion: parsed.data.schemaVersion,
    updatedAt: parsed.data.updatedAt,
    courses: normalizeOrders(parsed.data.courses),
    team: normalizeOrders(parsed.data.team),
    contacts: parsed.data.contacts,
  };
  return { ok: true, content };
}
