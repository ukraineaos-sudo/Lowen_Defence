/**
 * auth/session — стан сесії + storage status
 */
import { NextResponse } from "next/server";
import {
  getSessionFromCookies,
  getStorageStatus,
  isStorageConfigured,
} from "@/lib/auth/session";

export async function GET() {
  const session = await getSessionFromCookies();
  const storage = getStorageStatus();
  const storageConfigured = isStorageConfigured();
  if (!session) {
    return NextResponse.json({
      authenticated: false,
      storageConfigured,
      storage,
    });
  }
  return NextResponse.json({
    authenticated: true,
    username: session.u,
    storageConfigured,
    storage,
  });
}
