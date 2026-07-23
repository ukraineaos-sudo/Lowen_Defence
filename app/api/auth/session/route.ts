import { NextResponse } from "next/server";
import {
  getSessionFromCookies,
  isStorageConfigured,
} from "@/lib/auth/session";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({
    authenticated: true,
    username: session.u,
    storageConfigured: isStorageConfigured(),
  });
}
