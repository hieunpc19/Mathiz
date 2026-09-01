import { apiError, requireProfile } from "@/lib/api/auth";
import { submitAttempt } from "@/lib/exams/attempts";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> },
) {
  const auth = await requireProfile("student");
  if ("response" in auth) return auth.response;
  const { attemptId } = await params;
  let reason: "manual" | "timeout" = "manual";
  try {
    const text = await request.text();
    if (text) {
      const input = JSON.parse(text) as { reason?: unknown };
      if (input.reason === "timeout") reason = "timeout";
    }
  } catch {
    return apiError("INVALID_JSON", "Nội dung JSON không hợp lệ.", 400);
  }
  try {
    const result = await submitAttempt(attemptId, auth.profile.userId, reason);
    if (result.status === "not_found")
      return apiError("ATTEMPT_NOT_FOUND", "Không tìm thấy lượt thi.", 404);
    return Response.json({
      data: { submitted: true, alreadySubmitted: result.status === "already_submitted" },
    });
  } catch (error) {
    console.error("Submit attempt failed", error);
    return apiError("SUBMIT_FAILED", "Không thể nộp và chấm bài.", 503);
  }
}
