/**
 * Tests/form-guards.test.ts — антибот форми заявки
 */
import { describe, expect, it } from "vitest";
import {
  MAX_FORM_AGE_MS,
  MIN_SUBMIT_MS,
  evaluateFormTiming,
  hasConsent,
  isHoneypotTriggered,
} from "@/lib/applications/form-guards";

describe("form-guards", () => {
  it("honeypot fields trigger silent success path", () => {
    expect(isHoneypotTriggered({ honeypot: "x" })).toBe(true);
    expect(isHoneypotTriggered({ website: "http://spam" })).toBe(true);
    expect(isHoneypotTriggered({ name: "Ok" })).toBe(false);
  });

  it("hasConsent accepts true / 'true' / 1", () => {
    expect(hasConsent({ consent: true })).toBe(true);
    expect(hasConsent({ consent: "true" })).toBe(true);
    expect(hasConsent({ consent: 1 })).toBe(true);
    expect(hasConsent({ consent: false })).toBe(false);
    expect(hasConsent({})).toBe(false);
  });

  it("evaluateFormTiming: missing / too_fast / ok / expired", () => {
    const t = Date.now();

    expect(evaluateFormTiming({}, t).status).toBe("missing");
    expect(evaluateFormTiming({ _t: 0 }, t).status).toBe("missing");

    expect(
      evaluateFormTiming({ _t: t - (MIN_SUBMIT_MS - 200) }, t).status
    ).toBe("too_fast");

    expect(
      evaluateFormTiming({ _t: t - (MIN_SUBMIT_MS + 500) }, t).status
    ).toBe("ok");

    expect(
      evaluateFormTiming({ _t: t - (MAX_FORM_AGE_MS + 1000) }, t).status
    ).toBe("expired");
  });
});
