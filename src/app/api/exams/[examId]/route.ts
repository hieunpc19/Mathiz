import { apiError, requireProfile } from "@/lib/api/auth";
import { getExamAndVersion, mapExam } from "@/lib/exams/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ examId: string }> },
) {
  const auth = await requireProfile();
  if ("response" in auth) return auth.response;
  const { examId } = await params;

  try {
    const current = await getExamAndVersion(examId);
    if (!current || (current.exam.status !== "published" && auth.profile.role !== "admin")) {
      return apiError("EXAM_NOT_FOUND", "Không tìm thấy đề thi.", 404);
    }
    return Response.json({ data: { exam: mapExam(current.exam, current.version) } });
  } catch (error) {
    console.error("Get exam failed", error);
    return apiError("EXAM_UNAVAILABLE", "Không thể tải đề thi.", 503);
  }
}
