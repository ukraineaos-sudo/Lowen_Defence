/**
 * applications — публічний POST заявки
 * Антибот: honeypot, обовʼязковий _t, consent, rate limit.
 */
import { NextRequest, NextResponse } from "next/server";
import { createApplication } from "@/lib/applications/store";
import { readSiteContent } from "@/lib/content/store";
import { notifyApplicationByEmail } from "@/lib/mail/notify-application";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";

const MIN_SUBMIT_MS = 2500;
const MAX_FORM_AGE_MS = 2 * 60 * 60 * 1000; // 2 год
const APPS_LIMIT = 5;
const APPS_WINDOW_MS = 15 * 60 * 1000; // 5 заявок / 15 хв / IP

function hasConsent(body: Record<string, unknown>): boolean {
  return body.consent === true || body.consent === "true" || body.consent === 1;
}

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
  if (body.honeypot || body.website || body.company_url || body.website_url_check) {
    return NextResponse.json({ success: true });
  }

  const startedAt = Number(body._t || body.formStartedAt || 0);
  if (!Number.isFinite(startedAt) || startedAt <= 0) {
    // Немає _t — схоже на прямий POST; тиха відповідь без запису
    return NextResponse.json({ success: true });
  }
  const age = Date.now() - startedAt;
  if (age < MIN_SUBMIT_MS || age > MAX_FORM_AGE_MS) {
    return NextResponse.json({ success: true });
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
  let courseTitleSnapshot = String(body.courseTitleSnapshot || "").trim();

  if (!courseTitleSnapshot) {
    const content = await readSiteContent();
    const course = content.courses.find((c) => c.id === courseId);
    if (course) {
      courseTitleSnapshot = course.title;
    } else if (courseId === "corporate") {
      courseTitleSnapshot = "Corporate Awareness Training — Security";
    } else {
      courseTitleSnapshot = "Індивідуальний запит";
    }
  }

  const result = await createApplication({
    name,
    phone,
    courseId,
    courseTitleSnapshot,
    comment: String(body.comment || body.message || ""),
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Не вдалося зберегти заявку" },
      { status: 400 }
    );
  }

  // --- 5. Email-сповіщення (Brevo, best-effort; можна без ключа) ---
  void notifyApplicationByEmail(result.application);

  return NextResponse.json({ success: true, id: result.application.id });
}
