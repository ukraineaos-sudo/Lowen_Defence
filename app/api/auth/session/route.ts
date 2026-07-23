import { NextResponse } from "next/server";
import {
  getSessionFromCookies,
  isStorageConfigured,
} from "@/lib/auth/session";
import { runtimeEnv } from "@/lib/env";

export async function GET() {
  const session = await getSessionFromCookies();
  const storageConfigured = isStorageConfigured();
  const blobEnvKeys = Object.keys(process.env)
    .filter((k) => /BLOB|READ_WRITE/i.test(k))
    .sort();

  const envProbe = {
    DATA_BLOB_READ_WRITE_TOKEN: Boolean(runtimeEnv("DATA_BLOB_READ_WRITE_TOKEN")),
    MEDIA_BLOB_READ_WRITE_TOKEN: Boolean(runtimeEnv("MEDIA_BLOB_READ_WRITE_TOKEN")),
    DATA_BLOB_READ_WRITE_TOKEN_STORE_ID: Boolean(
      runtimeEnv("DATA_BLOB_READ_WRITE_TOKEN_STORE_ID")
    ),
    MEDIA_BLOB_READ_WRITE_TOKEN_STORE_ID: Boolean(
      runtimeEnv("MEDIA_BLOB_READ_WRITE_TOKEN_STORE_ID")
    ),
    BLOB_READ_WRITE_TOKEN: Boolean(runtimeEnv("BLOB_READ_WRITE_TOKEN")),
    blobEnvKeys,
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
