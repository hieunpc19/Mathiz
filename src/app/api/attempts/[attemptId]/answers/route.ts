import { apiError, requireProfile } from "@/lib/api/auth";
import { saveAttemptAnswer } from "@/lib/exams/attempts";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> },
) {
  const auth = await requireProfile("student");
  if ("response" in auth) return auth.response;
  const { attemptId } = await params;
  let input: { questionId?: unknown; selectedKey?: unknown };
  try {
    input = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Nội dung JSON không hợp lệ.", 400);
  }
  if (
    typeof input.questionId !== "string" ||
    (input.selectedKey !== null && typeof input.selectedKey !== "string")
  ) {
    return apiError("VALIDATION_ERROR", "questionId hoặc selectedKey không hợp lệ.", 422);
  }

  try {
    const result = await saveAttemptAnswer(
      attemptId,
      auth.profile.userId,
      input.questionId,
      input.selectedKey as string | null,
    );
    if (result.status === "not_found")
      return apiError("ATTEMPT_NOT_FOUND", "Không tìm thấy lượt thi.", 404);
    if (result.status === "closed")
      return apiError("ATTEMPT_CLOSED", "Lượt thi đã kết thúc.", 409);
    if (result.status === "expired")
      return apiError("ATTEMPT_EXPIRED", "Thời gian làm bài đã hết.", 409);
    if (result.status === "invalid_question" || result.status === "invalid_answer")
      return apiError("INVALID_ANSWER", "Câu hỏi hoặc đáp án không hợp lệ.", 422);
    return Response.json({ data: { saved: true } });
  } catch (error) {
    console.error("Save answer failed", error);
    return apiError("ANSWER_SAVE_FAILED", "Không thể lưu đáp án.", 503);
  }
}
