/**
 * Tests/application-status.test.ts — runtime enum статусу заявки
 */
import { describe, expect, it } from "vitest";
import { parseApplicationStatus } from "@/lib/applications/status";

describe("parseApplicationStatus", () => {
  it("accepts new / processed", () => {
    expect(parseApplicationStatus("new")).toBe("new");
    expect(parseApplicationStatus("processed")).toBe("processed");
  });

  it("rejects garbage / empty", () => {
    expect(parseApplicationStatus("deleted-forever-and-ever")).toBeNull();
    expect(parseApplicationStatus("")).toBeNull();
    expect(parseApplicationStatus(null)).toBeNull();
    expect(parseApplicationStatus(1)).toBeNull();
  });
});
