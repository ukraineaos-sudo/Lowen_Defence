/**
 * lib/api/errors.ts — стабільні коди → HTTP + єдиний error envelope
 */
import { NextResponse } from "next/server";

export type ApiErrorField = { path: string; message: string };

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    fields: ApiErrorField[];
  };
  /** Compatibility flat fields for older clients */
  code: string;
  message: string;
};

/** HTTP-статус за стабільним кодом (без regex по тексту). */
export function apiStatusForError(code: string): number {
  if (code === "UNAUTHORIZED") return 401;
  if (code === "CSRF_REJECTED") return 403;
  if (code === "CONTENT_CONFLICT") return 409;
  if (code === "IMAGE_TOO_LARGE") return 413;
  if (code === "RATE_LIMITED") return 429;

  if (code.endsWith("_VALIDATION_FAILED") || code === "VALIDATION") return 400;
  if (
    code === "IMAGE_INVALID" ||
    code === "IMAGE_SIGNATURE_INVALID" ||
    code === "IMAGE_MIME_MISMATCH"
  ) {
    return 400;
  }

  if (code.endsWith("_NOT_FOUND") || code === "NOT_FOUND") return 404;

  if (
    code.endsWith("_STORAGE_MISSING") ||
    code.endsWith("_STORAGE_UNAVAILABLE") ||
    code === "STORAGE_MISSING" ||
    code === "STORAGE_UNAVAILABLE" ||
    code === "PASSWORD_STORE_UNAVAILABLE" ||
    code === "PASSWORD_NOT_CONFIGURED" ||
    code === "PASSWORD_HASH_MISSING" ||
    code === "PASSWORD_HASH_CORRUPTED" ||
    code === "MEDIA_STORAGE_MISSING" ||
    code === "MEDIA_STORAGE_UNAVAILABLE"
  ) {
    return 503;
  }

  if (code === "MEDIA_LOCAL_WRITE_FAILED") return 500;

  return 500;
}

/** JSON-відповідь з вкладеним error + flat code/message. */
export function apiErrorResponse(
  code: string,
  message: string,
  options?: { fields?: ApiErrorField[]; status?: number }
): NextResponse {
  const status = options?.status ?? apiStatusForError(code);
  const fields = options?.fields ?? [];
  const body: ApiErrorBody = {
    error: { code, message, fields },
    code,
    message,
  };
  return NextResponse.json(body, { status });
}
