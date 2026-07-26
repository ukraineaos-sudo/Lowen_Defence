/**
 * lib/applications/store.ts — заявки з форми
 * CRUD у private Blob (applications/y/m/) або data/applications/ (лише non-prod без token).
 */
import { list, put, del } from "@vercel/blob";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { CourseApplication, ApplicationStatus } from "@/src/types/application";
import { dataBlobToken } from "@/lib/env";

const APPS_PREFIX = "applications/";
const LOCAL_APPS = path.join(process.cwd(), "data", "applications");

export type ApplicationErrorCode =
  | "APPLICATION_NOT_FOUND"
  | "APPLICATION_VALIDATION_FAILED"
  | "APPLICATION_STORAGE_UNAVAILABLE"
  | "APPLICATION_STORAGE_MISSING"
  | "APPLICATION_WRITE_FAILED";

export type ApplicationMutationResult<T> =
  | { success: true; data: T }
  | { success: false; code: ApplicationErrorCode; error: string };

export type ApplicationListResult =
  | { success: true; applications: CourseApplication[] }
  | { success: false; code: ApplicationErrorCode; error: string };

function dataToken(): string | undefined {
  return dataBlobToken();
}

function appPathname(app: CourseApplication): string {
  const d = new Date(app.createdAt);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${APPS_PREFIX}${y}/${m}/${app.createdAt.replace(/[:.]/g, "-")}-${app.id}.json`;
}

function localWriteAllowed(): boolean {
  return process.env.NODE_ENV !== "production";
}

/** 1. Створити заявку (публічна форма). */
export async function createApplication(
  input: Omit<
    CourseApplication,
    "id" | "createdAt" | "updatedAt" | "status" | "processedAt"
  >
): Promise<ApplicationMutationResult<CourseApplication>> {
  const now = new Date().toISOString();
  const application: CourseApplication = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    name: input.name.slice(0, 100),
    phone: input.phone.slice(0, 50),
    courseId: input.courseId,
    courseTitleSnapshot: input.courseTitleSnapshot.slice(0, 200),
    comment: input.comment.slice(0, 3000),
    status: "new",
    processedAt: null,
  };

  const token = dataToken();
  if (token) {
    try {
      await put(appPathname(application), JSON.stringify(application, null, 2), {
        access: "private",
        token,
        addRandomSuffix: false,
        contentType: "application/json",
        allowOverwrite: true,
      });
      return { success: true, data: application };
    } catch (err) {
      console.error("Application blob write failed:", {
        code: "APPLICATION_STORAGE_UNAVAILABLE",
        error: err,
      });
      return {
        success: false,
        code: "APPLICATION_STORAGE_UNAVAILABLE",
        error: "Не вдалося зберегти заявку",
      };
    }
  }

  if (!localWriteAllowed()) {
    return {
      success: false,
      code: "APPLICATION_STORAGE_MISSING",
      error: "Сховище ще не налаштовано",
    };
  }

  try {
    fs.mkdirSync(LOCAL_APPS, { recursive: true });
    const file = path.join(
      LOCAL_APPS,
      `${Date.now()}-${application.id.slice(0, 8)}.json`
    );
    fs.writeFileSync(file, JSON.stringify(application, null, 2), "utf-8");
    return { success: true, data: application };
  } catch {
    return {
      success: false,
      code: "APPLICATION_STORAGE_MISSING",
      error: "Сховище ще не налаштовано",
    };
  }
}

/** 2. Список заявок для адмінки (новіші зверху). */
export async function listApplications(): Promise<ApplicationListResult> {
  const apps: CourseApplication[] = [];
  const token = dataToken();

  if (token) {
    try {
      const { blobs } = await list({ prefix: APPS_PREFIX, token });
      for (const blob of blobs) {
        if (!blob.pathname?.endsWith(".json")) continue;
        try {
          const res = await fetch(blob.url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) continue;
          const parsed = (await res.json()) as CourseApplication;
          if (parsed?.id) apps.push(parsed);
        } catch {
          /* skip corrupt item */
        }
      }
      return {
        success: true,
        applications: apps.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      };
    } catch (err) {
      console.warn("Application blob list failed:", {
        code: "APPLICATION_STORAGE_UNAVAILABLE",
        error: err,
      });
      return {
        success: false,
        code: "APPLICATION_STORAGE_UNAVAILABLE",
        error: "Сховище заявок тимчасово недоступне",
      };
    }
  }

  if (!localWriteAllowed()) {
    return {
      success: false,
      code: "APPLICATION_STORAGE_MISSING",
      error: "Сховище заявок не налаштовано",
    };
  }

  try {
    if (fs.existsSync(LOCAL_APPS)) {
      for (const file of fs.readdirSync(LOCAL_APPS).filter((f) => f.endsWith(".json"))) {
        try {
          const parsed = JSON.parse(
            fs.readFileSync(path.join(LOCAL_APPS, file), "utf-8")
          ) as CourseApplication;
          if (parsed?.id) apps.push(parsed);
        } catch {
          /* skip */
        }
      }
    }
  } catch {
    return {
      success: false,
      code: "APPLICATION_STORAGE_UNAVAILABLE",
      error: "Не вдалося прочитати локальні заявки",
    };
  }

  return {
    success: true,
    applications: apps.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
  };
}

/** 3. Знайти blob заявки за id (для patch/delete). */
async function findBlobByAppId(
  id: string
): Promise<{ pathname: string; url: string; app: CourseApplication } | null> {
  const token = dataToken();
  if (!token) return null;
  const { blobs } = await list({ prefix: APPS_PREFIX, token });
  for (const blob of blobs) {
    if (!blob.pathname?.endsWith(".json")) continue;
    try {
      const res = await fetch(blob.url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) continue;
      const app = (await res.json()) as CourseApplication;
      if (app.id === id) {
        return { pathname: blob.pathname!, url: blob.url, app };
      }
    } catch {
      /* skip */
    }
  }
  return null;
}

/** 4. Оновити статус (new / processed). */
export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<ApplicationMutationResult<CourseApplication>> {
  const token = dataToken();
  if (token) {
    try {
      const found = await findBlobByAppId(id);
      if (!found) {
        return {
          success: false,
          code: "APPLICATION_NOT_FOUND",
          error: "Заявку не знайдено",
        };
      }
      const application: CourseApplication = {
        ...found.app,
        status,
        updatedAt: new Date().toISOString(),
        processedAt: status === "processed" ? new Date().toISOString() : null,
      };
      await put(found.pathname, JSON.stringify(application, null, 2), {
        access: "private",
        token,
        addRandomSuffix: false,
        contentType: "application/json",
        allowOverwrite: true,
      });
      return { success: true, data: application };
    } catch (err) {
      console.error("Application status update failed", {
        code: "APPLICATION_STORAGE_UNAVAILABLE",
        applicationId: id,
        error: err,
      });
      return {
        success: false,
        code: "APPLICATION_STORAGE_UNAVAILABLE",
        error: "Не вдалося оновити заявку",
      };
    }
  }

  if (!localWriteAllowed()) {
    return {
      success: false,
      code: "APPLICATION_STORAGE_MISSING",
      error: "Сховище ще не налаштовано",
    };
  }

  try {
    if (!fs.existsSync(LOCAL_APPS)) {
      return {
        success: false,
        code: "APPLICATION_NOT_FOUND",
        error: "Заявку не знайдено",
      };
    }
    for (const file of fs.readdirSync(LOCAL_APPS).filter((f) => f.endsWith(".json"))) {
      const filePath = path.join(LOCAL_APPS, file);
      const app = JSON.parse(fs.readFileSync(filePath, "utf-8")) as CourseApplication;
      if (app.id === id) {
        app.status = status;
        app.updatedAt = new Date().toISOString();
        app.processedAt = status === "processed" ? new Date().toISOString() : null;
        fs.writeFileSync(filePath, JSON.stringify(app, null, 2), "utf-8");
        return { success: true, data: app };
      }
    }
    return {
      success: false,
      code: "APPLICATION_NOT_FOUND",
      error: "Заявку не знайдено",
    };
  } catch (err) {
    console.error("Application local status update failed", {
      code: "APPLICATION_WRITE_FAILED",
      applicationId: id,
      error: err,
    });
    return {
      success: false,
      code: "APPLICATION_WRITE_FAILED",
      error: "Не вдалося оновити заявку",
    };
  }
}

/** 5. Видалити заявку. */
export async function deleteApplication(
  id: string
): Promise<ApplicationMutationResult<null>> {
  const token = dataToken();
  if (token) {
    try {
      const found = await findBlobByAppId(id);
      if (!found) {
        return {
          success: false,
          code: "APPLICATION_NOT_FOUND",
          error: "Заявку не знайдено",
        };
      }
      await del(found.url, { token });
      return { success: true, data: null };
    } catch (err) {
      console.error("Application delete failed", {
        code: "APPLICATION_STORAGE_UNAVAILABLE",
        applicationId: id,
        error: err,
      });
      return {
        success: false,
        code: "APPLICATION_STORAGE_UNAVAILABLE",
        error: "Не вдалося видалити заявку",
      };
    }
  }

  if (!localWriteAllowed()) {
    return {
      success: false,
      code: "APPLICATION_STORAGE_MISSING",
      error: "Сховище ще не налаштовано",
    };
  }

  try {
    if (!fs.existsSync(LOCAL_APPS)) {
      return {
        success: false,
        code: "APPLICATION_NOT_FOUND",
        error: "Заявку не знайдено",
      };
    }
    for (const file of fs.readdirSync(LOCAL_APPS).filter((f) => f.endsWith(".json"))) {
      const filePath = path.join(LOCAL_APPS, file);
      const app = JSON.parse(fs.readFileSync(filePath, "utf-8")) as CourseApplication;
      if (app.id === id) {
        fs.unlinkSync(filePath);
        return { success: true, data: null };
      }
    }
    return {
      success: false,
      code: "APPLICATION_NOT_FOUND",
      error: "Заявку не знайдено",
    };
  } catch (err) {
    console.error("Application local delete failed", {
      code: "APPLICATION_WRITE_FAILED",
      applicationId: id,
      error: err,
    });
    return {
      success: false,
      code: "APPLICATION_WRITE_FAILED",
      error: "Не вдалося видалити заявку",
    };
  }
}
