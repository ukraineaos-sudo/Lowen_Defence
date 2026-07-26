/**
 * admin/password — зміна пароля
 */
import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  getActivePasswordResult,
  writePasswordHash,
} from "@/lib/auth/password-store";
import { getSessionFromCookies } from "@/lib/auth/session";
import { runtimeEnv } from "@/lib/env";

const MIN_LEN = 8;

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Невірний Origin" }, { status: 403 });
  }

  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Неавторизований доступ" }, { status: 401 });
  }

  if (!runtimeEnv("AUTH_SECRET")) {
    return NextResponse.json(
      { error: "AUTH_SECRET не налаштовано" },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");
  const confirmPassword = String(body.confirmPassword || "");

  if (newPassword.length < MIN_LEN) {
    return NextResponse.json(
      { error: `Новий пароль має містити щонайменше ${MIN_LEN} символів` },
      { status: 400 }
    );
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      { error: "Новий пароль і підтвердження не збігаються" },
      { status: 400 }
    );
  }
  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: "Новий пароль має відрізнятися від поточного" },
      { status: 400 }
    );
  }

  const active = await getActivePasswordResult();
  if (!active.ok) {
    return NextResponse.json(
      { error: active.error, code: active.code },
      { status: 503 }
    );
  }
  if (!verifyPassword(currentPassword, active.hash)) {
    return NextResponse.json(
      { error: "Поточний пароль невірний" },
      { status: 400 }
    );
  }

  const nextHash = hashPassword(newPassword);
  const result = await writePasswordHash(nextHash);
  if (!result.success) {
    const status = result.code === "PASSWORD_STORE_UNAVAILABLE" ? 503 : 400;
    return NextResponse.json(
      { error: result.error || "Не вдалося зберегти пароль", code: result.code },
      { status }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Пароль змінено. Увійдіть з новим паролем при наступному логіні.",
    warning: result.warning,
    code: result.code,
  });
}
