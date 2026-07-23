/**
 * lib/auth/password.ts — криптографія паролів і HMAC
 * scrypt-хеш, перевірка, підпис payload сесії.
 */
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

/** 1. Згенерувати scrypt-хеш пароля (формат scrypt:salt:hash). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, Buffer.from(salt, "hex"), 64);
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

/** 2. Перевірити пароль проти хешу (scrypt / pbkdf2 / sha256). */
export function verifyPassword(inputPassword: string, targetHash?: string): boolean {
  if (!targetHash || !targetHash.trim()) return false;
  const hashToVerify = targetHash.trim();

  try {
    if (hashToVerify.startsWith("scrypt:")) {
      const parts = hashToVerify.split(":");
      if (parts.length !== 3) return false;
      const [, saltHex, expectedHashHex] = parts;
      const derivedKey = scryptSync(inputPassword, Buffer.from(saltHex, "hex"), 64);
      const expectedBuffer = Buffer.from(expectedHashHex, "hex");
      if (derivedKey.length !== expectedBuffer.length) return false;
      return timingSafeEqual(derivedKey, expectedBuffer);
    }

    if (hashToVerify.startsWith("pbkdf2:")) {
      const { pbkdf2Sync } = require("crypto") as typeof import("crypto");
      const parts = hashToVerify.split(":");
      if (parts.length !== 4) return false;
      const [, iterationsStr, saltHex, expectedHashHex] = parts;
      const iterations = parseInt(iterationsStr, 10) || 100000;
      const derivedKey = pbkdf2Sync(
        inputPassword,
        Buffer.from(saltHex, "hex"),
        iterations,
        64,
        "sha512"
      );
      const expectedBuffer = Buffer.from(expectedHashHex, "hex");
      if (derivedKey.length !== expectedBuffer.length) return false;
      return timingSafeEqual(derivedKey, expectedBuffer);
    }

    if (hashToVerify.startsWith("sha256:")) {
      const parts = hashToVerify.split(":");
      if (parts.length !== 3) return false;
      const [, saltHex, expectedHashHex] = parts;
      const hash = createHash("sha256")
        .update(saltHex + inputPassword)
        .digest("hex");
      return timingSafeEqual(
        Buffer.from(hash, "hex"),
        Buffer.from(expectedHashHex, "hex")
      );
    }

    const hash = createHash("sha256").update(inputPassword).digest("hex");
    if (hash.length === hashToVerify.length) {
      return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(hashToVerify, "hex"));
    }
  } catch (err) {
    console.error("Error verifying password hash:", err);
  }

  return false;
}

/** 3. HMAC для тіла сесійного токена. */
export function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** 4. Випадковий AUTH_SECRET (скрипт credentials). */
export function generateAuthSecret(): string {
  return randomBytes(32).toString("hex");
}

/** 5. Порівняння рядків без timing-leak. */
export function timingSafeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
