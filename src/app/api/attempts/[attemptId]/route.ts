import { apiError, requireProfile } from "@/lib/api/auth";
import { loadAttempt } from "@/lib/exams/attempts";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ attemptId: string }> },
) {
  const auth = await requireProfile();
  if ("response" in auth) return auth.response;
  const { attemptId } = await params;
  try {
    const attempt = await loadAttempt(
      attemptId,
      auth.profile.userId,
      auth.profile.role === "admin",
    );
    if (!attempt) return apiError("ATTEMPT_NOT_FOUND", "Không tìm thấy lượt thi.", 404);
    return Response.json({ data: { attempt } });
  } catch (error) {
    console.error("Load attempt failed", error);
    return apiError("ATTEMPT_UNAVAILABLE", "Không thể tải lượt thi.", 503);
  }
}
