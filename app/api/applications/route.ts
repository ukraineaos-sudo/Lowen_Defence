/**
 * applications — публічний POST заявки
 * Антибот: honeypot, обовʼязковий _t, consent, rate limit.
 */
import { NextRequest, NextResponse } from "next/server";
import { createApplication } from "@/lib/applications/store";
import {
  evaluateFormTiming,
  hasConsent,
  isHoneypotTriggered,
} from "@/lib/applications/form-guards";
import { readSiteContent } from "@/lib/content/store";
import { localizedUk } from "@/lib/i18n/localized";
import { notifyApplicationByEmail } from "@/lib/mail/notify-application";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";

const APPS_LIMIT = 5;
const APPS_WINDOW_MS = 15 * 60 * 1000; // 5 заявок / 15 хв / IP

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  // --- 1. Rate limit за IP ---
  const ip = clientIp(req);
  const limited = rateLimit({
    key: `apps:${ip}`,
    limit: APPS_LIMIT,
    windowMs: APPS_WINDOW_MS,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Забагато заявок. Спробуйте пізніше." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      }
    );
  }

  // --- 2. Антибот: honeypot + обовʼязковий час заповнення ---
  if (isHoneypotTriggered(body)) {
    return NextResponse.json({ success: true });
  }

  const timing = evaluateFormTiming(body);
  if (timing.status === "missing" || timing.status === "too_fast") {
    return NextResponse.json({ success: true });
  }
  if (timing.status === "expired") {
    return NextResponse.json(
      {
        error:
          "Сесія форми застаріла. Оновіть сторінку або спробуйте надіслати заявку ще раз.",
        code: "FORM_EXPIRED",
      },
      { status: 400 }
    );
  }

  // --- 3. Consent на сервері ---
  if (!hasConsent(body)) {
    return NextResponse.json(
      { error: "Потрібна згода на обробку персональних даних" },
      { status: 400 }
    );
  }

  // --- 4. Валідація + snapshot назви курсу + createApplication ---
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  if (!name || !phone) {
    return NextResponse.json(
      { error: "Ім'я та телефон обов'язкові" },
      { status: 400 }
    );
  }

  const courseId = String(body.courseId || body.course || "").trim() || "custom";
  // Назву курсу завжди беремо з сервера (клієнтський courseTitleSnapshot ігноруємо)
  const content = await readSiteContent();
  const course = content.courses.find((c) => c.id === courseId);
  let courseTitleSnapshot: string;
  if (course) {
    courseTitleSnapshot = localizedUk(course.title);
  } else if (courseId === "corporate") {
    courseTitleSnapshot = "Корпоративний тренінг «Безпекова обізнаність»";
  } else {
    courseTitleSnapshot = "Індивідуальний запит";
  }

  const result = await createApplication({
    name,
    phone,
    courseId,
    courseTitleSnapshot,
    comment: String(body.comment || body.message || ""),
  });

  if (!result.success) {
    const status =
      result.code === "APPLICATION_STORAGE_UNAVAILABLE" ||
      result.code === "APPLICATION_STORAGE_MISSING"
        ? 503
        : 400;
    return NextResponse.json(
      {
        error: result.error || "Не вдалося зберегти заявку",
        code: result.code,
      },
      { status }
    );
  }

  // --- 5. Email (Brevo): await + короткий timeout, щоб Vercel не обірвав void ---
  await Promise.race([
    notifyApplicationByEmail(result.data),
    new Promise<void>((resolve) => setTimeout(resolve, 2500)),
  ]);

  return NextResponse.json({ success: true, id: result.data.id });
}
