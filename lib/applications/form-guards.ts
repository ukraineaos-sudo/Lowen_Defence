/**
 * lib/applications/form-guards.ts — антибот / consent для публічної форми
 * Чисті перевірки без I/O (зручно юніт-тестувати).
 */

export const MIN_SUBMIT_MS = 2500;
export const MAX_FORM_AGE_MS = 2 * 60 * 60 * 1000; // 2 год

/** 1. Чи спрацював honeypot (бот заповнив приховане поле). */
export function isHoneypotTriggered(body: Record<string, unknown>): boolean {
  return Boolean(
    body.honeypot || body.website || body.company_url || body.website_url_check
  );
}

/** 2. Згода на обробку ПД. */
export function hasConsent(body: Record<string, unknown>): boolean {
  return body.consent === true || body.consent === "true" || body.consent === 1;
}

export type FormTimingResult =
  | { status: "missing" }
  | { status: "too_fast" }
  | { status: "expired" }
  | { status: "ok"; ageMs: number };

/** 3. Вік форми за _t / formStartedAt. */
export function evaluateFormTiming(
  body: Record<string, unknown>,
  now = Date.now()
): FormTimingResult {
  const startedAt = Number(body._t || body.formStartedAt || 0);
  if (!Number.isFinite(startedAt) || startedAt <= 0) {
    return { status: "missing" };
  }
  const ageMs = now - startedAt;
  if (ageMs < MIN_SUBMIT_MS) return { status: "too_fast" };
  if (ageMs > MAX_FORM_AGE_MS) return { status: "expired" };
  return { status: "ok", ageMs };
}
