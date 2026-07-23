export type ApplicationStatus = "new" | "processed";

export interface CourseApplication {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  phone: string;
  courseId: string;
  courseTitleSnapshot: string;
  comment: string;
  status: ApplicationStatus;
  processedAt: string | null;
}
