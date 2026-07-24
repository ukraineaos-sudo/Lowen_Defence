/**
 * admin/applications — список/patch/delete
 */
import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { getSessionFromCookies } from "@/lib/auth/session";
import {
  deleteApplication,
  listApplications,
  updateApplicationStatus,
} from "@/lib/applications/store";
import type { ApplicationStatus } from "@/src/types/application";

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Неавторизований доступ" }, { status: 401 });
  }

  const statusParam = req.nextUrl.searchParams.get("status");
  const all = await listApplications();
  const newCount = all.filter((a) => a.status === "new").length;
  const apps =
    statusParam === "new" || statusParam === "processed"
      ? all.filter((a) => a.status === statusParam)
      : all;

  return NextResponse.json({ applications: apps, newCount });
}

export async function PATCH(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Невірний Origin" }, { status: 403 });
  }
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Неавторизований доступ" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "");
  const status = body.status as ApplicationStatus;

  if (!id || !status) {
    return NextResponse.json({ error: "id та status обов'язкові" }, { status: 400 });
  }

  const result = await updateApplicationStatus(id, status);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true, application: result.application });
}

export async function DELETE(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Невірний Origin" }, { status: 403 });
  }
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Неавторизований доступ" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const id = String(body.id || req.nextUrl.searchParams.get("id") || "");
  if (!id) {
    return NextResponse.json({ error: "id обов'язковий" }, { status: 400 });
  }

  const result = await deleteApplication(id);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
