import { apiError, requireProfile } from "@/lib/api/auth";
import { loadAttemptResult } from "@/lib/exams/attempts";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ attemptId: string }> },
) {
  const auth = await requireProfile();
  if ("response" in auth) return auth.response;
  const { attemptId } = await params;
  try {
    const result = await loadAttemptResult(
      attemptId,
      auth.profile.userId,
      auth.profile.role === "admin",
    );
    if (!result) return apiError("ATTEMPT_NOT_FOUND", "Không tìm thấy lượt thi.", 404);
    if (result === "in_progress")
      return apiError("ATTEMPT_IN_PROGRESS", "Lượt thi chưa được nộp.", 409);
    return Response.json({ data: { result } });
  } catch (error) {
    console.error("Load result failed", error);
    return apiError("RESULT_UNAVAILABLE", "Không thể tải kết quả.", 503);
  }
}
