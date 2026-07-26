/**
 * lib/content/content-state.ts — marker ініціалізації + fail-closed матриця
 * Pure resolve: current missing → marker × history (без I/O).
 */
import { z } from "zod";

export const CONTENT_STATE_PATH = "content/state.json";

export const contentStateSchema = z.object({
  schemaVersion: z.literal(1),
  initializedAt: z.string().min(1),
  lastContentUpdatedAt: z.string().min(1),
});

export type ContentState = z.infer<typeof contentStateSchema>;

export type ContentStateReadResult =
  | { status: "found"; state: ContentState }
  | { status: "not_found" }
  | { status: "unavailable"; error?: unknown };

export type HistoryInspectResult =
  | { status: "empty" }
  | { status: "exists"; count: number }
  | { status: "unavailable"; error?: unknown };

export type AdminBootstrapDecision =
  | { ok: true; mode: "first_run" }
  | {
      ok: false;
      code: "CONTENT_MISSING" | "STORAGE_UNAVAILABLE";
      error: string;
    };

/**
 * Коли current = not_found: marker і history оцінюються СПІЛЬНО.
 * Default / first_run — лише якщо обидва достовірно порожні.
 */
export function resolveAdminBootstrapWhenCurrentMissing(
  marker: ContentStateReadResult,
  history: HistoryInspectResult
): AdminBootstrapDecision {
  if (marker.status === "unavailable" || history.status === "unavailable") {
    return {
      ok: false,
      code: "STORAGE_UNAVAILABLE",
      error: "Не вдалося перевірити стан сховища. Збереження заборонено.",
    };
  }

  if (marker.status === "found" || history.status === "exists") {
    return {
      ok: false,
      code: "CONTENT_MISSING",
      error:
        "Основний файл контенту відсутній. Потрібне відновлення з історії.",
    };
  }

  // marker not_found + history empty
  return { ok: true, mode: "first_run" };
}

export function parseContentState(raw: unknown): ContentStateReadResult {
  const parsed = contentStateSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "unavailable", error: "Invalid content state.json" };
  }
  return { status: "found", state: parsed.data };
}

export function buildContentState(options: {
  initializedAt?: string;
  lastContentUpdatedAt: string;
  now?: string;
}): ContentState {
  const now = options.now ?? new Date().toISOString();
  return {
    schemaVersion: 1,
    initializedAt: options.initializedAt ?? now,
    lastContentUpdatedAt: options.lastContentUpdatedAt,
  };
}
