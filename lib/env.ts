/**
 * Read env at runtime (bracket access avoids Next build-time inlining of empty values).
 */
export function runtimeEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}
