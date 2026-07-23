import { NextRequest, NextResponse } from "next/server";
import { createApplication } from "@/lib/applications/store";
import { readSiteContent } from "@/lib/content/store";

const MIN_SUBMIT_MS = 2500;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  // Honeypot
  if (body.honeypot || body.website || body.company_url || body.website_url_check) {
    return NextResponse.json({ success: true });
  }

  const startedAt = Number(body._t || body.formStartedAt || 0);
  if (startedAt && Date.now() - startedAt < MIN_SUBMIT_MS) {
    return NextResponse.json({ success: true });
  }

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

  return NextResponse.json({ success: true, id: result.application.id });
}
