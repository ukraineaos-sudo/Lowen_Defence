/**
 * lib/auth/password-state.ts — marker ініціалізації пароля + pure policy
 */
import { z } from "zod";

export const PASSWORD_STATE_PATH = "auth/password-state.json";

export const passwordStateSchema = z.object({
  schemaVersion: z.literal(1),
  initializedAt: z.string().min(1),
  lastChangedAt: z.string().min(1),
});

export type PasswordState = z.infer<typeof passwordStateSchema>;

export type PasswordHashProbe =
  | { status: "found"; hash: string }
  | { status: "not_found" }
  | { status: "unavailable"; error?: unknown }
  | { status: "corrupted"; error?: unknown };

export type PasswordStateProbe =
  | { status: "found"; state: PasswordState }
  | { status: "not_found" }
  | { status: "unavailable"; error?: unknown }
  | { status: "corrupted"; error?: unknown };

export type PasswordBootstrapDecision =
  | { status: "use_hash"; hash: string }
  | { status: "bootstrap" }
  | {
      status: "blocked";
      code:
        | "PASSWORD_HASH_MISSING"
        | "PASSWORD_HASH_CORRUPTED"
        | "PASSWORD_STORE_UNAVAILABLE";
    };

export function isSupportedPasswordHash(value: string): boolean {
  return value.startsWith("scrypt:") || value.startsWith("pbkdf2:");
}

export function parsePasswordState(raw: unknown): PasswordStateProbe {
  const parsed = passwordStateSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "corrupted", error: "Invalid password-state.json" };
  }
  return { status: "found", state: parsed.data };
}

export function buildPasswordState(options: {
  initializedAt?: string;
  lastChangedAt: string;
  now?: string;
}): PasswordState {
  const now = options.now ?? new Date().toISOString();
  return {
    schemaVersion: 1,
    initializedAt: options.initializedAt ?? now,
    lastChangedAt: options.lastChangedAt,
  };
}

/**
 * Hash × marker policy (Data Blob mode).
 * bootstrap лише коли hash not_found і marker not_found.
 */
export function resolvePasswordBootstrap(
  hash: PasswordHashProbe,
  state: PasswordStateProbe
): PasswordBootstrapDecision {
  if (hash.status === "found") {
    return { status: "use_hash", hash: hash.hash };
  }

  if (hash.status === "corrupted") {
    return { status: "blocked", code: "PASSWORD_HASH_CORRUPTED" };
  }

  if (hash.status === "unavailable") {
    return { status: "blocked", code: "PASSWORD_STORE_UNAVAILABLE" };
  }

  // hash not_found
  if (state.status === "found") {
    return { status: "blocked", code: "PASSWORD_HASH_MISSING" };
  }

  if (state.status === "unavailable" || state.status === "corrupted") {
    return { status: "blocked", code: "PASSWORD_STORE_UNAVAILABLE" };
  }

  return { status: "bootstrap" };
}
