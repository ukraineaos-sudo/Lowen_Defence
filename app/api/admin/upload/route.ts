/**
 * admin/upload — завантаження фото
 */
import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { getSessionFromCookies } from "@/lib/auth/session";
import { apiErrorResponse } from "@/lib/api/errors";
import { uploadImageFromDataUrl } from "@/lib/blob/media";

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return apiErrorResponse("CSRF_REJECTED", "Невірний Origin");
  }
  const session = await getSessionFromCookies();
  if (!session) {
    return apiErrorResponse("UNAUTHORIZED", "Неавторизований доступ");
  }

  const body = await req.json().catch(() => ({}));
  const dataUrl = String(body.dataUrl || "");
  const folder = String(body.folder || "general");

  if (!dataUrl.startsWith("data:image/")) {
    return apiErrorResponse(
      "IMAGE_INVALID",
      "Будь ласка, надайте коректне зображення"
    );
  }

  const result = await uploadImageFromDataUrl(dataUrl, folder);
  if (!result.success) {
    return apiErrorResponse(result.code, result.error);
  }
  return NextResponse.json({ success: true, url: result.url });
}
