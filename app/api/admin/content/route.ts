/**
 * admin/content — GET/POST контенту
 */
import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { getSessionFromCookies } from "@/lib/auth/session";
import {
  readSiteContentForAdmin,
  writeSiteContent,
} from "@/lib/content/store";

async function requireAdmin() {
  return getSessionFromCookies();
}

// --- 1. GET: поточний SiteContent для адмінки (без фейкового default при Blob down) ---
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Неавторизований доступ" }, { status: 401 });
  }
  const result = await readSiteContentForAdmin();
  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        code: result.code,
      },
      { status: 503 }
    );
  }
  return NextResponse.json(result.content);
}

// --- 2. POST: CSRF + запис контенту (із history) ---
export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Невірний Origin" }, { status: 403 });
  }
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Неавторизований доступ" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const result = await writeSiteContent(body as Parameters<typeof writeSiteContent>[0]);
  if (!result.success) {
    const status = result.code === "STORAGE_UNAVAILABLE" ? 503 : 400;
    return NextResponse.json(
      {
        error: result.error || "Сховище ще не налаштовано",
        code: result.code,
      },
      { status }
    );
  }
  return NextResponse.json({ success: true, content: result.content });
}
