import { NextResponse } from "next/server";
import {
  getSessionFromCookies,
  isStorageConfigured,
} from "@/lib/auth/session";
import { runtimeEnv } from "@/lib/env";

export async function GET() {
  const session = await getSessionFromCookies();
  const storageConfigured = isStorageConfigured();
  const envProbe = {
    DATA_BLOB_READ_WRITE_TOKEN: Boolean(runtimeEnv("DATA_BLOB_READ_WRITE_TOKEN")),
    MEDIA_BLOB_READ_WRITE_TOKEN: Boolean(runtimeEnv("MEDIA_BLOB_READ_WRITE_TOKEN")),
    DATA_BLOB_READ_WRITE_TOKEN_STORE_ID: Boolean(
      runtimeEnv("DATA_BLOB_READ_WRITE_TOKEN_STORE_ID")
    ),
    MEDIA_BLOB_READ_WRITE_TOKEN_STORE_ID: Boolean(
      runtimeEnv("MEDIA_BLOB_READ_WRITE_TOKEN_STORE_ID")
    ),
    // common Vercel default name
    BLOB_READ_WRITE_TOKEN: Boolean(runtimeEnv("BLOB_READ_WRITE_TOKEN")),
  };

  if (!session) {
    return NextResponse.json({ authenticated: false, storageConfigured, envProbe });
  }
  return NextResponse.json({
    authenticated: true,
    username: session.u,
    storageConfigured,
    envProbe,
  });
}
