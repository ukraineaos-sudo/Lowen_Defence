/**
 * admin/applications — список заявок (GET)
 * Мутації: /api/admin/applications/[id]
 */
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { apiErrorResponse } from "@/lib/api/errors";
import { listApplications } from "@/lib/applications/store";
import { parseApplicationStatus } from "@/lib/applications/status";

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return apiErrorResponse("UNAUTHORIZED", "Неавторизований доступ");
  }

  const listed = await listApplications();
  if (!listed.success) {
    return apiErrorResponse(listed.code, listed.error);
  }

  const statusParam = req.nextUrl.searchParams.get("status");
  const all = listed.applications;
  const newCount = all.filter((a) => a.status === "new").length;
  const filterStatus = statusParam ? parseApplicationStatus(statusParam) : null;
  const apps = filterStatus
    ? all.filter((a) => a.status === filterStatus)
    : all;

  return NextResponse.json({ applications: apps, newCount });
}
