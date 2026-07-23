/**
 * lib/env.ts — читання змінних оточення
 * Runtime-доступ до env (у т.ч. Blob-токенів) без «залипання» порожніх значень на білді.
 */

/** 1. Одне env-значення (trim, порожнє → undefined). */
export function runtimeEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

/** 2. Перше непорожнє серед кількох імен (для alias Vercel). */
export function runtimeEnvAny(...names: string[]): string | undefined {
  for (const name of names) {
    const value = runtimeEnv(name);
    if (value) return value;
  }
  return undefined;
}

/** 3. Токен public Media Blob (коротке ім'я або …_READ_WRITE_TOKEN). */
export function mediaBlobToken(): string | undefined {
  return runtimeEnvAny(
    "MEDIA_BLOB_READ_WRITE_TOKEN",
    "MEDIA_BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN"
  );
}

/** 4. Токен private Data Blob (контент / заявки / пароль). */
export function dataBlobToken(): string | undefined {
  return runtimeEnvAny(
    "DATA_BLOB_READ_WRITE_TOKEN",
    "DATA_BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN"
  );
}
