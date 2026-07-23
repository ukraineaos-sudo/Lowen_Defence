/**
 * Read env at runtime (bracket access avoids Next build-time inlining of empty values).
 */
export function runtimeEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

/** First non-empty value among candidate env names. */
export function runtimeEnvAny(...names: string[]): string | undefined {
  for (const name of names) {
    const value = runtimeEnv(name);
    if (value) return value;
  }
  return undefined;
}

/** Media Blob RW token (Vercel prefix quirk may append _READ_WRITE_TOKEN). */
export function mediaBlobToken(): string | undefined {
  return runtimeEnvAny(
    "MEDIA_BLOB_READ_WRITE_TOKEN",
    "MEDIA_BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN"
  );
}

/** Private data Blob RW token. */
export function dataBlobToken(): string | undefined {
  return runtimeEnvAny(
    "DATA_BLOB_READ_WRITE_TOKEN",
    "DATA_BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN"
  );
}
