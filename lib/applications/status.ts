/**
 * lib/applications/status.ts — runtime-валідація статусу заявки
 */
import { z } from "zod";
import type { ApplicationStatus } from "@/src/types/application";

export const applicationStatusSchema = z.enum(["new", "processed"]);

export function parseApplicationStatus(
  value: unknown
): ApplicationStatus | null {
  const parsed = applicationStatusSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
