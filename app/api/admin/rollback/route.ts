/**
 * admin/rollback — відкат версії (також OCC)
 */
import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { getSessionFromCookies } from "@/lib/auth/session";
import { rollbackContent } from "@/lib/content/store";
import { z } from "zod";

const rollbackRequestSchema = z.object({
  timestamp: z.string().min(1),
  expectedRevision: z.string().min(1).nullable(),
});

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Невірний Origin" }, { status: 403 });
  }
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Неавторизований доступ" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = rollbackRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Не вказано версію для відновлення", code: "VALIDATION" },
      { status: 400 }
    );
  }

  const result = await rollbackContent(
    parsed.data.timestamp,
    parsed.data.expectedRevision
  );
  if (!result.success) {
    const status =
      result.code === "STORAGE_UNAVAILABLE"
        ? 503
        : result.code === "CONTENT_CONFLICT"
          ? 409
          : result.code === "NOT_FOUND"
            ? 404
            : 400;
    return NextResponse.json(
      { error: result.error || "Сховище ще не налаштовано", code: result.code },
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
