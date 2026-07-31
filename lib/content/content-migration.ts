/**
 * lib/content/content-migration.ts — аудит legacy SiteContent
 * Safe transforms → strict validate. Без I/O.
 */
import type { SiteContent } from "@/src/types/content";
import {
  validateSiteContent,
  type ValidationFieldIssue,
} from "./validate";

export type MigrationChange = {
  path: string;
  from: unknown;
  to: unknown;
  reason: string;
};

export type CompatibilityResult =
  | { status: "valid"; content: SiteContent }
  | {
      status: "migratable";
      migrated: SiteContent;
      changes: MigrationChange[];
    }
  | {
      status: "blocked";
      issues: ValidationFieldIssue[];
      safeChanges?: MigrationChange[];
    };

export type AnalyzeOptions = {
  /** Blob uploadedAt (ISO), якщо updatedAt відсутній/битий. */
  blobUploadedAt?: string;
};

const COURSE_KEYS = new Set([
  "id",
  "enabled",
  "featured",
  "order",
  "tag",
  "title",
  "description",
  "meta",
  "price",
  "priceNote",
  "buttonLabel",
  "image",
]);

const TEAM_KEYS = new Set([
  "id",
  "enabled",
  "order",
  "name",
  "description",
  "image",
]);

const CONTACT_KEYS = new Set([
  "phoneDisplay",
  "phoneHref",
  "email",
  "websiteDisplay",
  "websiteUrl",
  "germanWebsiteUrl",
  "privacyUrl",
]);

const IMAGE_KEYS = new Set([
  "url",
  "alt",
  "focalX",
  "focalY",
  "mobileUrl",
  "mobileFocalX",
  "mobileFocalY",
]);

const ROOT_KEYS = new Set([
  "schemaVersion",
  "updatedAt",
  "courses",
  "team",
  "contacts",
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function looksLikeV1(raw: Record<string, unknown>): boolean {
  return (
    Array.isArray(raw.courses) &&
    Array.isArray(raw.team) &&
    isPlainObject(raw.contacts)
  );
}

function isIsoDatetime(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  const t = Date.parse(value);
  return Number.isFinite(t);
}

function stripUnknownKeys(
  obj: Record<string, unknown>,
  allowed: Set<string>,
  path: string,
  changes: MigrationChange[]
): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (allowed.has(key)) {
      next[key] = value;
      continue;
    }
    changes.push({
      path: path ? `${path}.${key}` : key,
      from: value,
      to: undefined,
      reason: "removed_unknown_field",
    });
  }
  return next;
}

function trimStringAt(
  obj: Record<string, unknown>,
  key: string,
  path: string,
  changes: MigrationChange[]
) {
  const value = obj[key];
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === value) return;
    changes.push({
      path: `${path}.${key}`,
      from: value,
      to: trimmed,
      reason: "trimmed_whitespace",
    });
    obj[key] = trimmed;
    return;
  }

  // Dual-shape LocalizedText: { uk, en? }
  if (!isPlainObject(value) || typeof value.uk !== "string") return;
  const next: { uk: string; en?: string } = { uk: value.uk.trim() };
  let changed = next.uk !== value.uk;
  if (typeof value.en === "string") {
    const enTrimmed = value.en.trim();
    if (enTrimmed) next.en = enTrimmed;
    if (enTrimmed !== value.en) changed = true;
  }
  if (!changed) return;
  changes.push({
    path: `${path}.${key}`,
    from: value,
    to: next,
    reason: "trimmed_whitespace",
  });
  obj[key] = next;
}

function migrateImage(
  raw: unknown,
  path: string,
  changes: MigrationChange[]
): unknown {
  if (!isPlainObject(raw)) return raw;
  const img = stripUnknownKeys({ ...raw }, IMAGE_KEYS, path, changes);

  for (const key of ["url", "alt"] as const) {
    trimStringAt(img, key, path, changes);
  }
  if (typeof img.mobileUrl === "string") {
    const trimmed = img.mobileUrl.trim();
    if (trimmed === "") {
      changes.push({
        path: `${path}.mobileUrl`,
        from: img.mobileUrl,
        to: undefined,
        reason: "removed_empty_mobileUrl",
      });
      delete img.mobileUrl;
    } else if (trimmed !== img.mobileUrl) {
      changes.push({
        path: `${path}.mobileUrl`,
        from: img.mobileUrl,
        to: trimmed,
        reason: "trimmed_whitespace",
      });
      img.mobileUrl = trimmed;
    }
  }

  return img;
}

function migrateCourse(
  raw: unknown,
  index: number,
  changes: MigrationChange[]
): unknown {
  if (!isPlainObject(raw)) return raw;
  const path = `courses.${index}`;
  const course = stripUnknownKeys({ ...raw }, COURSE_KEYS, path, changes);

  for (const key of [
    "id",
    "tag",
    "title",
    "description",
    "price",
    "priceNote",
    "buttonLabel",
  ] as const) {
    trimStringAt(course, key, path, changes);
  }

  if (Array.isArray(course.meta)) {
    course.meta = course.meta.map((item, metaIndex) => {
      if (typeof item === "string") {
        const trimmed = item.trim();
        if (trimmed !== item) {
          changes.push({
            path: `${path}.meta.${metaIndex}`,
            from: item,
            to: trimmed,
            reason: "trimmed_whitespace",
          });
        }
        return trimmed;
      }
      if (isPlainObject(item) && typeof item.uk === "string") {
        const next: { uk: string; en?: string } = { uk: item.uk.trim() };
        let changed = next.uk !== item.uk;
        if (typeof item.en === "string") {
          const enTrimmed = item.en.trim();
          if (enTrimmed) next.en = enTrimmed;
          if (enTrimmed !== item.en) changed = true;
        }
        if (changed) {
          changes.push({
            path: `${path}.meta.${metaIndex}`,
            from: item,
            to: next,
            reason: "trimmed_whitespace",
          });
        }
        return next;
      }
      return item;
    });
  }

  if ("image" in course) {
    course.image = migrateImage(course.image, `${path}.image`, changes);
  }

  return course;
}

function migrateTeamMember(
  raw: unknown,
  index: number,
  changes: MigrationChange[]
): unknown {
  if (!isPlainObject(raw)) return raw;
  const path = `team.${index}`;
  const member = stripUnknownKeys({ ...raw }, TEAM_KEYS, path, changes);

  for (const key of ["id", "name", "description"] as const) {
    trimStringAt(member, key, path, changes);
  }

  if ("image" in member) {
    member.image = migrateImage(member.image, `${path}.image`, changes);
  }

  return member;
}

function migrateContacts(
  raw: unknown,
  changes: MigrationChange[]
): unknown {
  if (!isPlainObject(raw)) return raw;
  const contacts = stripUnknownKeys({ ...raw }, CONTACT_KEYS, "contacts", changes);
  for (const key of CONTACT_KEYS) {
    trimStringAt(contacts, key, "contacts", changes);
  }
  return contacts;
}

/**
 * Лише однозначні механічні правки. Не чіпає URL/email/featured/дублі.
 */
export function applySafeContentMigrations(
  raw: unknown,
  options: AnalyzeOptions = {}
): { data: unknown; changes: MigrationChange[] } {
  const changes: MigrationChange[] = [];
  if (!isPlainObject(raw)) {
    return { data: raw, changes };
  }

  let data = stripUnknownKeys({ ...raw }, ROOT_KEYS, "", changes);

  if (data.schemaVersion === undefined && looksLikeV1(data)) {
    changes.push({
      path: "schemaVersion",
      from: undefined,
      to: 1,
      reason: "defaulted_schemaVersion_v1",
    });
    data.schemaVersion = 1;
  }

  if (!isIsoDatetime(data.updatedAt)) {
    const fromBlob = options.blobUploadedAt;
    if (fromBlob && isIsoDatetime(fromBlob)) {
      changes.push({
        path: "updatedAt",
        from: data.updatedAt,
        to: fromBlob,
        reason: "updatedAt_from_blob_uploadedAt",
      });
      data.updatedAt = fromBlob;
    }
  }

  if (Array.isArray(data.courses)) {
    const courses = data.courses.map((course: unknown, index: number) =>
      migrateCourse(course, index, changes)
    );
    data.courses = courses.map((course: unknown, index: number) => {
      if (!isPlainObject(course)) return course;
      const expected = index + 1;
      if (course.order !== expected) {
        changes.push({
          path: `courses.${index}.order`,
          from: course.order,
          to: expected,
          reason: "normalized_by_array_position",
        });
        return { ...course, order: expected };
      }
      return course;
    });
  }

  if (Array.isArray(data.team)) {
    const team = data.team.map((member: unknown, index: number) =>
      migrateTeamMember(member, index, changes)
    );
    data.team = team.map((member: unknown, index: number) => {
      if (!isPlainObject(member)) return member;
      const expected = index + 1;
      if (member.order !== expected) {
        changes.push({
          path: `team.${index}.order`,
          from: member.order,
          to: expected,
          reason: "normalized_by_array_position",
        });
        return { ...member, order: expected };
      }
      return member;
    });
  }

  if ("contacts" in data) {
    data.contacts = migrateContacts(data.contacts, changes);
  }

  return { data, changes };
}

/** Аудит raw JSON проти строгої stored-схеми. */
export function analyzeContentCompatibility(
  raw: unknown,
  options: AnalyzeOptions = {}
): CompatibilityResult {
  const { data, changes } = applySafeContentMigrations(raw, options);
  const validated = validateSiteContent(data);

  if (!validated.ok) {
    return {
      status: "blocked",
      issues: validated.fields,
      safeChanges: changes.length ? changes : undefined,
    };
  }

  if (changes.length === 0) {
    return { status: "valid", content: validated.content };
  }

  return {
    status: "migratable",
    migrated: validated.content,
    changes,
  };
}

/** Текстовий звіт для CLI. */
export function formatCompatibilityReport(
  result: CompatibilityResult,
  meta?: { pathname?: string; url?: string }
): string {
  const lines: string[] = [];
  if (meta?.pathname) lines.push(`pathname: ${meta.pathname}`);
  if (meta?.url) lines.push(`url: ${meta.url}`);

  if (result.status === "valid") {
    lines.push("VALID");
    lines.push("Strict SiteContent schema passed.");
    lines.push("No migration required.");
    return lines.join("\n");
  }

  if (result.status === "migratable") {
    lines.push("MIGRATABLE");
    lines.push(`Safe changes: ${result.changes.length}`);
    for (const change of result.changes) {
      lines.push(
        `- ${change.path}: ${JSON.stringify(change.from)} → ${JSON.stringify(change.to)} (${change.reason})`
      );
    }
    lines.push("Run with --apply-safe to write after raw backup.");
    return lines.join("\n");
  }

  lines.push("BLOCKED");
  for (const issue of result.issues) {
    lines.push("");
    lines.push(issue.path || "(root)");
    lines.push(`  ${issue.message}`);
  }
  if (result.safeChanges?.length) {
    lines.push("");
    lines.push(`Safe changes prepared but not enough (${result.safeChanges.length}):`);
    for (const change of result.safeChanges) {
      lines.push(
        `- ${change.path}: ${JSON.stringify(change.from)} → ${JSON.stringify(change.to)} (${change.reason})`
      );
    }
  }
  lines.push("");
  lines.push("Automatic write is disabled. Fix manually, then re-run audit.");
  return lines.join("\n");
}
