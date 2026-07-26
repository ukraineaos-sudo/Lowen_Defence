/**
 * admin/content — GET/POST контенту (OCC: expectedRevision + ETag)
 */
import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { getSessionFromCookies } from "@/lib/auth/session";
import {
  readSiteContentForAdmin,
  writeSiteContent,
} from "@/lib/content/store";
import { parseSaveContentRequest } from "@/lib/content/validate";

async function requireAdmin() {
  return getSessionFromCookies();
}

// --- 1. GET: SiteContent + revision для адмінки ---
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Неавторизований доступ" }, { status: 401 });
  }
  const result = await readSiteContentForAdmin();
  if (!result.ok) {
    const status = result.code === "CONTENT_MISSING" ? 409 : 503;
    return NextResponse.json(
      {
        error: result.error,
        code: result.code,
      },
      { status }
    );
  }
  return NextResponse.json({
    content: result.content,
    revision: result.revision,
    source: result.source,
  });
}

// --- 2. POST: CSRF + conditional write ---
export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Невірний Origin" }, { status: 403 });
  }
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Неавторизований доступ" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = parseSaveContentRequest(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error, code: "CONTENT_VALIDATION_FAILED" },
      { status: 400 }
    );
  }

  const result = await writeSiteContent(
    parsed.content,
    parsed.expectedRevision
  );
  if (!result.success) {
    const status =
      result.code === "CONTENT_CONFLICT"
        ? 409
        : result.code === "STORAGE_UNAVAILABLE"
          ? 503
          : 400;
    return NextResponse.json(
      {
        error: result.error || "Сховище ще не налаштовано",
        code: result.code,
        fields: "fields" in result ? result.fields : undefined,
      },
      { status }
    );
  }
  return NextResponse.json({
    success: true,
    content: result.content,
    revision: result.revision,
    code: result.code,
    warning:
      result.code === "CONTENT_STATE_WRITE_FAILED" ? result.error : undefined,
  });
}
