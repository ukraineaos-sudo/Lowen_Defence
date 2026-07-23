/**
 * admin/upload — завантаження фото
 */
import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { getSessionFromCookies } from "@/lib/auth/session";
import { uploadImageFromDataUrl } from "@/lib/blob/media";

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Невірний Origin" }, { status: 403 });
  }
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Неавторизований доступ" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const dataUrl = String(body.dataUrl || "");
  const folder = String(body.folder || "general");

  if (!dataUrl.startsWith("data:image/")) {
    return NextResponse.json(
      { error: "Будь ласка, надайте коректне зображення" },
      { status: 400 }
    );
  }

  const result = await uploadImageFromDataUrl(dataUrl, folder);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true, url: result.url });
}
