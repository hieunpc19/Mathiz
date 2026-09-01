import { apiError, requireProfile } from "@/lib/api/auth";
import { getAttemptExam, getExamAndVersion } from "@/lib/exams/data";

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

    const exam = await getAttemptExam(examId, current.version.id);
    if (!exam) {
      return apiError("EXAM_NOT_FOUND", "Không tìm thấy nội dung đề thi.", 404);
    }

    return Response.json({
      data: {
        exam,
      },
    });
  } catch (error) {
    console.error("Get practice exam failed", error);
    return apiError("EXAM_UNAVAILABLE", "Không thể tải đề luyện tập.", 503);
  }
}
