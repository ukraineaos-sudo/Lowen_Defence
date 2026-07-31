/**
 * resolve-content.ts — SiteContent з LocalizedText → plain strings для публічного UI
 *
 * Якщо в Blob лише plain uk-рядки, для `en` підставляємо переклад з default-site-content
 * за id курсу/учасника (адмінка EN-полів не має).
 */
import type {
  Contacts,
  Course,
  ResponsiveImageData,
  SiteContent,
  TeamMember,
} from "@/src/types/content";
import { defaultSiteContent } from "@/src/data/default-site-content";
import type { Locale } from "./locale";
import {
  resolveLocalized,
  type LocalizedText,
} from "./localized";

/** Для en: stored.en → default.en → uk. */
function resolveWithDefaultEn(
  stored: LocalizedText,
  fallback: LocalizedText | undefined,
  locale: Locale
): string {
  if (locale !== "en") return resolveLocalized(stored, locale);
  if (typeof stored === "object" && stored.en?.trim()) return stored.en;
  if (fallback && typeof fallback === "object" && fallback.en?.trim()) {
    return fallback.en;
  }
  return resolveLocalized(stored, "uk");
}

/** meta[] з підстановкою EN з default за індексом. */
function resolveMetaWithDefault(
  stored: LocalizedText[],
  fallback: LocalizedText[] | undefined,
  locale: Locale
): string[] {
  return stored.map((item, index) =>
    resolveWithDefaultEn(item, fallback?.[index], locale)
  );
}

export type ResolvedResponsiveImage = Omit<ResponsiveImageData, "alt"> & {
  alt: string;
};

export type ResolvedCourse = Omit<
  Course,
  | "tag"
  | "title"
  | "description"
  | "meta"
  | "price"
  | "priceNote"
  | "buttonLabel"
  | "image"
> & {
  tag: string;
  title: string;
  description: string;
  meta: string[];
  price: string;
  priceNote: string;
  buttonLabel: string;
  image: ResolvedResponsiveImage;
};

export type ResolvedTeamMember = Omit<
  TeamMember,
  "name" | "description" | "image"
> & {
  name: string;
  description: string;
  image: ResolvedResponsiveImage;
};

export type ResolvedSiteContent = {
  schemaVersion: number;
  updatedAt: string;
  courses: ResolvedCourse[];
  team: ResolvedTeamMember[];
  contacts: Contacts;
};

/** Резолвить alt зображення для локалі. */
function resolveImage(
  image: ResponsiveImageData,
  fallbackAlt: LocalizedText | undefined,
  locale: Locale
): ResolvedResponsiveImage {
  return {
    ...image,
    alt: resolveWithDefaultEn(
      image.alt as LocalizedText,
      fallbackAlt,
      locale
    ),
  };
}

/** Резолвить курс для локалі (en з Blob або з default seed). */
function resolveCourse(
  course: Course,
  locale: Locale,
  fallback?: Course
): ResolvedCourse {
  return {
    ...course,
    tag: resolveWithDefaultEn(course.tag, fallback?.tag, locale),
    title: resolveWithDefaultEn(course.title, fallback?.title, locale),
    description: resolveWithDefaultEn(
      course.description,
      fallback?.description,
      locale
    ),
    meta: resolveMetaWithDefault(course.meta, fallback?.meta, locale),
    price: resolveWithDefaultEn(course.price, fallback?.price, locale),
    priceNote: resolveWithDefaultEn(
      course.priceNote,
      fallback?.priceNote,
      locale
    ),
    buttonLabel: resolveWithDefaultEn(
      course.buttonLabel,
      fallback?.buttonLabel,
      locale
    ),
    image: resolveImage(course.image, fallback?.image.alt, locale),
  };
}

/** Резолвить учасника команди для локалі. */
function resolveMember(
  member: TeamMember,
  locale: Locale,
  fallback?: TeamMember
): ResolvedTeamMember {
  return {
    ...member,
    name: resolveWithDefaultEn(member.name, fallback?.name, locale),
    description: resolveWithDefaultEn(
      member.description,
      fallback?.description,
      locale
    ),
    image: resolveImage(member.image, fallback?.image.alt, locale),
  };
}

/** Повний SiteContent → plain-string контент для публічних секцій. */
export function resolveSiteContent(
  content: SiteContent,
  locale: Locale
): ResolvedSiteContent {
  const defaultByCourseId = new Map(
    defaultSiteContent.courses.map((c) => [c.id, c])
  );
  const defaultByMemberId = new Map(
    defaultSiteContent.team.map((m) => [m.id, m])
  );

  return {
    schemaVersion: content.schemaVersion,
    updatedAt: content.updatedAt,
    courses: content.courses.map((c) =>
      resolveCourse(c, locale, defaultByCourseId.get(c.id))
    ),
    team: content.team.map((m) =>
      resolveMember(m, locale, defaultByMemberId.get(m.id))
    ),
    contacts: content.contacts,
  };
}
