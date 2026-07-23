import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { verifyPassword } from "@/lib/auth/password";
import { getActivePasswordHash } from "@/lib/auth/password-store";
import {
  SESSION_COOKIE,
  createSessionToken,
  getAdminUsername,
  isStorageConfigured,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { runtimeEnv } from "@/lib/env";

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Невірний Origin" }, { status: 403 });
  }

  const secret = runtimeEnv("AUTH_SECRET");
  const passwordHash = await getActivePasswordHash();

  if (!secret || !passwordHash) {
    return NextResponse.json(
      { error: "Авторизацію не налаштовано (відсутні AUTH_SECRET / пароль)" },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const username = String(body.username || "");
  const password = String(body.password || "");
  const adminUser = getAdminUsername();

  if (username === adminUser && verifyPassword(password, passwordHash)) {
    const token = createSessionToken(username);
    if (!token) {
      return NextResponse.json({ error: "Помилка створення сесії" }, { status: 500 });
    }
    const res = NextResponse.json({ success: true, username });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  }

  return NextResponse.json(
    { error: "Невірне ім'я користувача або пароль" },
    { status: 401 }
  );
}

export async function GET() {
  return NextResponse.json({ storageConfigured: isStorageConfigured() });
}
