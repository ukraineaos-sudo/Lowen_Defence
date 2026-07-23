/**
 * auth/session — стан сесії + storageConfigured
 */
import { NextResponse } from "next/server";
import {
  getSessionFromCookies,
  isStorageConfigured,
} from "@/lib/auth/session";

export async function GET() {
  const session = await getSessionFromCookies();
  const storageConfigured = isStorageConfigured();
  if (!session) {
    return NextResponse.json({ authenticated: false, storageConfigured });
  }
  return NextResponse.json({
    authenticated: true,
    username: session.u,
    storageConfigured,
  });
}
