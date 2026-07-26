/**
 * lib/admin/admin-fetch.ts — єдиний клієнтський fetch для адмінки
 * credentials, безпечний JSON, стабільні коди, 401 → login.
 */
export type AdminApiError = {
  code: string;
  message: string;
  status: number;
  fields?: Array<{ path: string; message: string }>;
};

export type AdminFetchResult<T> =
  | { ok: true; data: T; response: Response }
  | { ok: false; error: AdminApiError; response?: Response };

let sessionExpiredRedirecting = false;

/** Редірект на login при закінченні сесії (без кількох паралельних переходів). */
export function redirectSessionExpired(): void {
  if (typeof window === "undefined") return;
  if (sessionExpiredRedirecting) return;
  sessionExpiredRedirecting = true;
  const next = `${window.location.pathname}${window.location.search}`;
  const params = new URLSearchParams({
    reason: "session_expired",
    next: next.startsWith("/admin") ? next : "/admin",
  });
  window.location.assign(`/admin/login?${params.toString()}`);
}

function redirectToLogin(): void {
  redirectSessionExpired();
}

function fallbackMessage(status: number): string {
  if (status === 400) return "Некоректні дані запиту.";
  if (status === 401) return "Сесію завершено. Увійдіть знову.";
  if (status === 403) return "Запит відхилено (Origin/CSRF).";
  if (status === 404) return "Ресурс не знайдено.";
  if (status === 409) return "Конфлікт версій. Оновіть дані.";
  if (status === 413) return "Файл занадто великий.";
  if (status === 429) return "Забагато запитів. Спробуйте пізніше.";
  if (status === 503) return "Сховище тимчасово недоступне.";
  if (status >= 500) return "Помилка сервера. Спробуйте пізніше.";
  return "Невідома помилка запиту.";
}

function parseAdminError(data: unknown, status: number): AdminApiError {
  if (data && typeof data === "object") {
    const root = data as Record<string, unknown>;
    const nested = root.error;

    if (nested && typeof nested === "object") {
      const err = nested as Record<string, unknown>;
      const code =
        typeof err.code === "string"
          ? err.code
          : typeof root.code === "string"
            ? root.code
            : "UNKNOWN";
      const message =
        typeof err.message === "string"
          ? err.message
          : fallbackMessage(status);
      const fields = Array.isArray(err.fields)
        ? (err.fields as Array<{ path: string; message: string }>)
        : undefined;
      return { code, message, status, fields };
    }

    const message =
      typeof root.error === "string"
        ? root.error
        : typeof root.message === "string"
          ? root.message
          : fallbackMessage(status);
    const code = typeof root.code === "string" ? root.code : "UNKNOWN";
    const fields = Array.isArray(root.fields)
      ? (root.fields as Array<{ path: string; message: string }>)
      : undefined;
    return { code, message, status, fields };
  }

  return { code: "UNKNOWN", message: fallbackMessage(status), status };
}

/** Адмінський fetch: credentials, JSON, 401 redirect, без throw на HTTP-помилках. */
export async function adminFetch<T = unknown>(
  input: string,
  init?: RequestInit
): Promise<AdminFetchResult<T>> {
  try {
    const response = await fetch(input, {
      ...init,
      credentials: "include",
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });

    const rawText = await response.text();
    let data: unknown = null;
    if (rawText.trim()) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = null;
      }
    }

    if (response.status === 401) {
      redirectToLogin();
      return {
        ok: false,
        error: parseAdminError(data, 401),
        response,
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        error: parseAdminError(data, response.status),
        response,
      };
    }

    return { ok: true, data: (data ?? {}) as T, response };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return {
        ok: false,
        error: {
          code: "ABORTED",
          message: "Запит скасовано.",
          status: 0,
        },
      };
    }
    return {
      ok: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Помилка звʼязку із сервером.",
        status: 0,
      },
    };
  }
}
