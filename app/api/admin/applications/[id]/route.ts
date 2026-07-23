/**
 * admin/applications/[id] — PATCH/DELETE однієї заявки
 */
import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { getSessionFromCookies } from "@/lib/auth/session";
import {
  deleteApplication,
  updateApplicationStatus,
} from "@/lib/applications/store";
import type { ApplicationStatus } from "@/src/types/application";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Невірний Origin" }, { status: 403 });
  }
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Неавторизований доступ" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const status = body.status as ApplicationStatus;
  if (!status) {
    return NextResponse.json({ error: "status обов'язковий" }, { status: 400 });
  }

  const result = await updateApplicationStatus(id, status);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true, application: result.application });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Невірний Origin" }, { status: 403 });
  }
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Неавторизований доступ" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const result = await deleteApplication(id);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
