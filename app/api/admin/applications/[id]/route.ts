/**
 * admin/applications/[id] — PATCH/DELETE однієї заявки
 */
import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { getSessionFromCookies } from "@/lib/auth/session";
import { apiErrorResponse } from "@/lib/api/errors";
import {
  deleteApplication,
  updateApplicationStatus,
} from "@/lib/applications/store";
import { parseApplicationStatus } from "@/lib/applications/status";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!assertSameOrigin(req)) {
    return apiErrorResponse("CSRF_REJECTED", "Невірний Origin");
  }
  const session = await getSessionFromCookies();
  if (!session) {
    return apiErrorResponse("UNAUTHORIZED", "Неавторизований доступ");
  }

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const status = parseApplicationStatus(body.status);
  if (!status) {
    return apiErrorResponse(
      "APPLICATION_VALIDATION_FAILED",
      "Некоректний status (очікується new | processed)"
    );
  }

  const result = await updateApplicationStatus(id, status);
  if (!result.success) {
    return apiErrorResponse(result.code, result.error);
  }
  return NextResponse.json({ success: true, application: result.data });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!assertSameOrigin(req)) {
    return apiErrorResponse("CSRF_REJECTED", "Невірний Origin");
  }
  const session = await getSessionFromCookies();
  if (!session) {
    return apiErrorResponse("UNAUTHORIZED", "Неавторизований доступ");
  }

  const { id } = await ctx.params;
  const result = await deleteApplication(id);
  if (!result.success) {
    return apiErrorResponse(result.code, result.error);
  }
  return NextResponse.json({ success: true });
}
