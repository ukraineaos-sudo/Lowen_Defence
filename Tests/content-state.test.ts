/**
 * Tests/content-state.test.ts — marker × history fail-closed матриця
 */
import { describe, expect, it } from "vitest";
import {
  parseContentState,
  resolveAdminBootstrapWhenCurrentMissing,
  type ContentState,
} from "@/lib/content/content-state";

const sampleState: ContentState = {
  schemaVersion: 1,
  initializedAt: "2026-07-26T10:00:00.000Z",
  lastContentUpdatedAt: "2026-07-26T10:00:00.000Z",
};

describe("resolveAdminBootstrapWhenCurrentMissing", () => {
  it("returns default on true first run", () => {
    const decision = resolveAdminBootstrapWhenCurrentMissing(
      { status: "not_found" },
      { status: "empty" }
    );
    expect(decision).toEqual({ ok: true, mode: "first_run" });
  });

  it("fails closed when current is missing after initialization", () => {
    const decision = resolveAdminBootstrapWhenCurrentMissing(
      { status: "found", state: sampleState },
      { status: "empty" }
    );
    expect(decision.ok).toBe(false);
    if (!decision.ok) {
      expect(decision.code).toBe("CONTENT_MISSING");
    }
  });

  it("does not treat history as first run", () => {
    const decision = resolveAdminBootstrapWhenCurrentMissing(
      { status: "not_found" },
      { status: "exists", count: 1 }
    );
    expect(decision.ok).toBe(false);
    if (!decision.ok) {
      expect(decision.code).toBe("CONTENT_MISSING");
    }
  });

  it("fails closed when state marker cannot be checked", () => {
    const decision = resolveAdminBootstrapWhenCurrentMissing(
      { status: "unavailable", error: "boom" },
      { status: "empty" }
    );
    expect(decision.ok).toBe(false);
    if (!decision.ok) {
      expect(decision.code).toBe("STORAGE_UNAVAILABLE");
    }
  });

  it("fails closed when history inspect is unavailable", () => {
    const decision = resolveAdminBootstrapWhenCurrentMissing(
      { status: "not_found" },
      { status: "unavailable", error: "list failed" }
    );
    expect(decision.ok).toBe(false);
    if (!decision.ok) {
      expect(decision.code).toBe("STORAGE_UNAVAILABLE");
    }
  });

  it("CONTENT_MISSING when marker found even if history exists", () => {
    const decision = resolveAdminBootstrapWhenCurrentMissing(
      { status: "found", state: sampleState },
      { status: "exists", count: 3 }
    );
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.code).toBe("CONTENT_MISSING");
  });
});

describe("parseContentState", () => {
  it("treats corrupted state.json as unavailable, not not_found", () => {
    const result = parseContentState({ schemaVersion: 99 });
    expect(result.status).toBe("unavailable");
  });

  it("accepts valid state", () => {
    const result = parseContentState(sampleState);
    expect(result.status).toBe("found");
    if (result.status === "found") {
      expect(result.state.initializedAt).toBe(sampleState.initializedAt);
    }
  });
});
