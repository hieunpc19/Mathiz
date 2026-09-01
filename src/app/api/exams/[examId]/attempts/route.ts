import { apiError, requireProfile } from "@/lib/api/auth";
import { getExamAndVersion } from "@/lib/exams/data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ examId: string }> },
) {
  const auth = await requireProfile("student");
  if ("response" in auth) return auth.response;
  const { examId } = await params;

  try {
    const current = await getExamAndVersion(examId);
    if (!current || current.exam.status !== "published") {
      return apiError("EXAM_NOT_FOUND", "Không tìm thấy đề thi đã xuất bản.", 404);
    }
    const startedAt = new Date();
    const deadlineAt = new Date(
      startedAt.getTime() + (current.version.duration_seconds ?? 0) * 1000,
    );
    const supabase = createSupabaseAdminClient();
    const { data: attempt, error } = await supabase
      .from("attempts")
      .insert({
        student_id: auth.profile.userId,
        exam_version_id: current.version.id,
        status: "in_progress",
        started_at: startedAt.toISOString(),
        deadline_at: deadlineAt.toISOString(),
      })
      .select("id")
      .single();
    if (error) throw error;
    return Response.json({ data: { attemptId: attempt.id } }, { status: 201 });
  } catch (error) {
    console.error("Start attempt failed", error);
    return apiError("ATTEMPT_CREATE_FAILED", "Không thể bắt đầu lượt thi.", 503);
  }
}
