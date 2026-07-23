import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { getSessionFromCookies } from "@/lib/auth/session";
import { rollbackContent } from "@/lib/content/store";

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Невірний Origin" }, { status: 403 });
  }
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Неавторизований доступ" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const timestamp = String(body.timestamp || "");
  if (!timestamp) {
    return NextResponse.json(
      { error: "Не вказано версію для відновлення" },
      { status: 400 }
    );
  }

  const result = await rollbackContent(timestamp);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Сховище ще не налаштовано" },
      { status: 400 }
    );
  }
  return NextResponse.json({ success: true, content: result.content });
}
