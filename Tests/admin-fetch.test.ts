/**
 * Tests/admin-fetch.test.ts — adminFetch envelope + 401
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("adminFetch", () => {
  const assignMock = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    assignMock.mockReset();
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("window", {
      location: {
        pathname: "/admin/courses",
        search: "",
        assign: assignMock,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("JSON success returns typed data", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ applications: [{ id: "1" }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const { adminFetch } = await import("@/lib/admin/admin-fetch");
    const result = await adminFetch<{ applications: Array<{ id: string }> }>(
      "/api/admin/applications"
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.applications[0].id).toBe("1");
  });

  it("empty success body does not throw", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("", { status: 200 }));
    const { adminFetch } = await import("@/lib/admin/admin-fetch");
    const result = await adminFetch("/api/auth/logout", { method: "POST" });
    expect(result.ok).toBe(true);
  });

  it("non-JSON error becomes AdminApiError", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("oops", { status: 500 })
    );
    const { adminFetch } = await import("@/lib/admin/admin-fetch");
    const result = await adminFetch("/api/admin/content");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(500);
      expect(result.error.message).toContain("Помилка сервера");
    }
  });

  it("401 triggers session expired redirect once", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "Неавторизований доступ" }), {
        status: 401,
      })
    );
    const { adminFetch } = await import("@/lib/admin/admin-fetch");
    await adminFetch("/api/admin/history");
    await adminFetch("/api/admin/history");
    expect(assignMock).toHaveBeenCalledTimes(1);
    expect(String(assignMock.mock.calls[0][0])).toContain(
      "reason=session_expired"
    );
  });

  it("reads nested error envelope and flat compatibility", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: {
              code: "CONTENT_CONFLICT",
              message: "Конфлікт",
              fields: [],
            },
            code: "CONTENT_CONFLICT",
            message: "Конфлікт",
          }),
          { status: 409 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: "Старе повідомлення",
            code: "MEDIA_STORAGE_UNAVAILABLE",
          }),
          { status: 503 }
        )
      );

    const { adminFetch } = await import("@/lib/admin/admin-fetch");
    const conflict = await adminFetch("/api/admin/content", { method: "POST" });
    expect(conflict.ok).toBe(false);
    if (!conflict.ok) {
      expect(conflict.error.code).toBe("CONTENT_CONFLICT");
      expect(conflict.error.message).toBe("Конфлікт");
    }

    const storage = await adminFetch("/api/admin/upload", { method: "POST" });
    expect(storage.ok).toBe(false);
    if (!storage.ok) {
      expect(storage.error.code).toBe("MEDIA_STORAGE_UNAVAILABLE");
      expect(storage.error.message).toBe("Старе повідомлення");
    }
  });
});
