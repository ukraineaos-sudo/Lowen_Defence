/**
 * admin/history — список версій
 */
import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { listContentHistory } from "@/lib/content/store";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Неавторизований доступ" }, { status: 401 });
  }
  const history = await listContentHistory();
  return NextResponse.json(history);
}
