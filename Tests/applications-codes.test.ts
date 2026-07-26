/**
 * Tests/applications-codes.test.ts — стабільні коди заявок без regex по тексту
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const listMock = vi.fn();
const putMock = vi.fn();
const delMock = vi.fn();
let dataTokenValue: string | undefined;

vi.mock("@vercel/blob", () => ({
  list: (...args: unknown[]) => listMock(...args),
  put: (...args: unknown[]) => putMock(...args),
  del: (...args: unknown[]) => delMock(...args),
}));

vi.mock("@/lib/env", () => ({
  dataBlobToken: () => dataTokenValue,
  mediaBlobToken: () => undefined,
  runtimeEnv: () => undefined,
  runtimeEnvAny: () => undefined,
}));

describe("applications store codes + route mapping", () => {
  beforeEach(() => {
    listMock.mockReset();
    putMock.mockReset();
    delMock.mockReset();
    dataTokenValue = "data-token";
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("missing application → APPLICATION_NOT_FOUND", async () => {
    listMock.mockResolvedValueOnce({ blobs: [] });
    const { updateApplicationStatus } = await import(
      "@/lib/applications/store"
    );
    const result = await updateApplicationStatus("missing-id", "processed");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe("APPLICATION_NOT_FOUND");
    }
  });

  it("route maps APPLICATION_NOT_FOUND → 404 without regex on message text", async () => {
    listMock.mockResolvedValue({ blobs: [] });
    vi.doMock("@/lib/auth/csrf", () => ({ assertSameOrigin: () => true }));
    vi.doMock("@/lib/auth/session", () => ({
      getSessionFromCookies: async () => ({ u: "admin", pv: "x" }),
    }));

    const { PATCH } = await import("@/app/api/admin/applications/[id]/route");
    const res = await PATCH(
      new Request("http://localhost/api/admin/applications/x", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "processed" }),
      }) as never,
      { params: Promise.resolve({ id: "x" }) }
    );
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.code).toBe("APPLICATION_NOT_FOUND");
    expect(data.error.code).toBe("APPLICATION_NOT_FOUND");
  });

  it("changing Ukrainian message text would not matter — status follows code", async () => {
    // apiStatusForError is source of truth
    const { apiStatusForError } = await import("@/lib/api/errors");
    expect(apiStatusForError("APPLICATION_NOT_FOUND")).toBe(404);
    expect(apiStatusForError("APPLICATION_STORAGE_UNAVAILABLE")).toBe(503);
    expect(apiStatusForError("APPLICATION_VALIDATION_FAILED")).toBe(400);
    expect(apiStatusForError("SOME_UNKNOWN_CODE")).toBe(500);
  });

  it("blob list failure → APPLICATION_STORAGE_UNAVAILABLE, no empty fake list", async () => {
    listMock.mockRejectedValueOnce(new Error("blob down"));
    const { listApplications } = await import("@/lib/applications/store");
    const result = await listApplications();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe("APPLICATION_STORAGE_UNAVAILABLE");
    }
  });

  it("production without token → APPLICATION_STORAGE_MISSING on create", async () => {
    dataTokenValue = undefined;
    vi.stubEnv("NODE_ENV", "production");
    const { createApplication } = await import("@/lib/applications/store");
    const result = await createApplication({
      name: "Test",
      phone: "+380",
      courseId: "c1",
      courseTitleSnapshot: "Course",
      comment: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe("APPLICATION_STORAGE_MISSING");
    }
  });
});
