import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { getSessionFromCookies } from "@/lib/auth/session";
import { readSiteContent, writeSiteContent } from "@/lib/content/store";

async function requireAdmin() {
  return getSessionFromCookies();
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Неавторизований доступ" }, { status: 401 });
  }
  const content = await readSiteContent();
  return NextResponse.json(content);
}

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
    return NextResponse.json(
      { error: result.error || "Сховище ще не налаштовано" },
      { status: 400 }
    );
  }
  return NextResponse.json({ success: true, content: result.content });
}
