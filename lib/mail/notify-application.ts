/**
 * lib/mail/notify-application.ts — email про нову заявку (Brevo API)
 * Best-effort: помилка відправки лише в лог, форму не валить.
 */
import type { CourseApplication } from "@/src/types/application";
import { runtimeEnv } from "@/lib/env";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseFrom(raw: string): { name?: string; email: string } | null {
  const trimmed = raw.trim();
  const angled = trimmed.match(/^(.+?)\s*<([^>]+)>$/);
  if (angled) {
    return { name: angled[1].trim().replace(/^["']|["']$/g, ""), email: angled[2].trim() };
  }
  if (trimmed.includes("@")) return { email: trimmed };
  return null;
}

/** ISO → читабельна дата в Europe/Kyiv для листа. */
function formatApplicationTimeKyiv(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const formatted = new Intl.DateTimeFormat("uk-UA", {
    timeZone: "Europe/Kyiv",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
  return `${formatted} (Київ)`;
}

/** 1. Чи налаштовано Brevo (ключ + from/to). */
export function isApplicationMailConfigured(): boolean {
  return Boolean(
    runtimeEnv("BREVO_API_KEY") &&
      runtimeEnv("NOTIFY_EMAIL_TO") &&
      (runtimeEnv("NOTIFY_EMAIL_FROM") || runtimeEnv("NOTIFY_EMAIL_TO"))
  );
}

/** 2. Надіслати лист про заявку на office (не кидає наружу). */
export async function notifyApplicationByEmail(
  application: CourseApplication
): Promise<void> {
  const apiKey = runtimeEnv("BREVO_API_KEY");
  const toRaw = runtimeEnv("NOTIFY_EMAIL_TO");
  const fromRaw =
    runtimeEnv("NOTIFY_EMAIL_FROM") || runtimeEnv("NOTIFY_EMAIL_TO");

  if (!apiKey || !toRaw || !fromRaw) {
    return;
  }

  const from = parseFrom(fromRaw);
  const toEmail = toRaw.trim();
  if (!from?.email || !toEmail.includes("@")) {
    console.error("Application mail: invalid NOTIFY_EMAIL_FROM / TO");
    return;
  }

  const siteUrl = runtimeEnv("SITE_URL") || "";
  const adminAppsUrl = siteUrl
    ? `${siteUrl.replace(/\/$/, "")}/admin/applications`
    : "/admin/applications";

  const createdAtDisplay = formatApplicationTimeKyiv(application.createdAt);

  const subject = `Нова заявка: ${application.name} — ${application.courseTitleSnapshot}`;
  const textContent = [
    "Нова заявка з сайту Löwen Defence Україна",
    "",
    `Ім'я: ${application.name}`,
    `Телефон: ${application.phone}`,
    `Курс: ${application.courseTitleSnapshot}`,
    `Коментар: ${application.comment || "—"}`,
    `ID: ${application.id}`,
    `Час: ${createdAtDisplay}`,
    "",
    `Адмінка: ${adminAppsUrl}`,
  ].join("\n");

  const htmlContent = `
    <h2>Нова заявка з сайту</h2>
    <p><strong>Ім'я:</strong> ${escapeHtml(application.name)}</p>
    <p><strong>Телефон:</strong> ${escapeHtml(application.phone)}</p>
    <p><strong>Курс:</strong> ${escapeHtml(application.courseTitleSnapshot)}</p>
    <p><strong>Коментар:</strong><br/>${escapeHtml(application.comment || "—").replace(/\n/g, "<br/>")}</p>
    <p><strong>ID:</strong> ${escapeHtml(application.id)}<br/>
    <strong>Час:</strong> ${escapeHtml(createdAtDisplay)}</p>
    <p><a href="${escapeHtml(adminAppsUrl)}">Відкрити в адмінці</a></p>
  `.trim();

  try {
    const res = await fetch(BREVO_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: from.name
          ? { name: from.name, email: from.email }
          : { email: from.email },
        to: [{ email: toEmail }],
        subject,
        textContent,
        htmlContent,
        tags: ["site-application"],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Brevo send failed:", res.status, body.slice(0, 500));
    }
  } catch (err) {
    console.error("Brevo send error:", err);
  }
}
