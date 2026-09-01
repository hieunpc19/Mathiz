import { apiError, requireProfile } from "@/lib/api/auth";
import {
  encryptAnswer,
  normalizeQuestionPositions,
  refreshVersionTotals,
  requireDraftVersion,
  validateQuestionInput,
} from "@/lib/exams/admin-versions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ examId: string; versionId: string; questionId: string }>;
  },
) {
  const auth = await requireProfile("admin");
  if ("response" in auth) return auth.response;
  const { examId, versionId, questionId } = await params;
  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Dữ liệu JSON không hợp lệ.", 400);
  }
  try {
    const draft = await requireDraftVersion(examId, versionId);
    if ("error" in draft)
      return apiError(
        "VERSION_IMMUTABLE",
        "Phiên bản đã xuất bản không thể sửa.",
        409,
      );
    const question = validateQuestionInput(input);
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("questions")
      .update({
        category: question.category,
        body_md: question.bodyMd,
        options: question.options,
        correct_key: encryptAnswer(question.correctAnswer),
        points_correct: question.points,
        points_wrong: 0,
        image_paths: question.assetNames,
        explanation_md: question.explanationMd,
      })
      .eq("id", questionId)
      .eq("exam_version_id", versionId)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data)
      return apiError("QUESTION_NOT_FOUND", "Không tìm thấy câu hỏi.", 404);
    await refreshVersionTotals(versionId);
    return Response.json({ data: { saved: true } });
  } catch (error) {
    console.error("Update question failed", error);
    return apiError(
      "QUESTION_UPDATE_FAILED",
      error instanceof Error ? error.message : "Không thể lưu câu hỏi.",
      422,
    );
  }
}

export async function DELETE(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ examId: string; versionId: string; questionId: string }>;
  },
) {
  const auth = await requireProfile("admin");
  if ("response" in auth) return auth.response;
  const { examId, versionId, questionId } = await params;
  try {
    const draft = await requireDraftVersion(examId, versionId);
    if ("error" in draft)
      return apiError(
        "VERSION_IMMUTABLE",
        "Chỉ được xóa câu trong bản nháp.",
        409,
      );
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", questionId)
      .eq("exam_version_id", versionId);
    if (error) throw error;
    const { data: remaining, error: remainingError } = await supabase
      .from("questions")
      .select("id")
      .eq("exam_version_id", versionId)
      .order("position");
    if (remainingError) throw remainingError;
    await normalizeQuestionPositions(
      versionId,
      (remaining ?? []).map((row) => row.id),
    );
    await refreshVersionTotals(versionId);
    return Response.json({ data: { deleted: true } });
  } catch (error) {
    console.error("Delete question failed", error);
    return apiError("QUESTION_DELETE_FAILED", "Không thể xóa câu hỏi.", 500);
  }
}
