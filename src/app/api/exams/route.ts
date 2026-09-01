import { apiError, requireProfile } from "@/lib/api/auth";
import { listPublishedExams } from "@/lib/exams/data";

export async function GET() {
  const auth = await requireProfile();
  if ("response" in auth) return auth.response;
  try {
    return Response.json({ data: { exams: await listPublishedExams() } });
  } catch (error) {
    console.error("List exams failed", error);
    return apiError("EXAMS_UNAVAILABLE", "Không thể tải danh sách đề thi.", 503);
  }
}
