import { apiError, requireProfile } from "@/lib/api/auth";
import {
  encryptAnswer,
  normalizeQuestionPositions,
  refreshVersionTotals,
  requireDraftVersion,
  validateQuestionInput,
} from "@/lib/exams/admin-versions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ examId: string; versionId: string }> },
) {
  const auth = await requireProfile("admin");
  if ("response" in auth) return auth.response;
  const { examId, versionId } = await params;
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
        "Chỉ được thêm câu vào bản nháp.",
        409,
      );
    const question = validateQuestionInput(input);
    const supabase = createSupabaseAdminClient();
    const { data: last } = await supabase
      .from("questions")
      .select("position")
      .eq("exam_version_id", versionId)
      .order("position", { ascending: false })
      .limit(1);
    const position = (last?.[0]?.position ?? 0) + 1;
    const { data, error } = await supabase
      .from("questions")
      .insert({
        exam_version_id: versionId,
        position,
        code: `q${String(position).padStart(2, "0")}`,
        category: question.category,
        body_md: question.bodyMd,
        options: question.options,
        correct_key: encryptAnswer(question.correctAnswer),
        points_correct: question.points,
        points_wrong: 0,
        image_paths: question.assetNames,
        tags: [],
        explanation_md: question.explanationMd,
      })
      .select("id")
      .single();
    if (error) throw error;
    await refreshVersionTotals(versionId);
    return Response.json(
      { data: { questionId: data.id, position } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create question failed", error);
    return apiError(
      "QUESTION_CREATE_FAILED",
      error instanceof Error ? error.message : "Không thể tạo câu hỏi.",
      422,
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ examId: string; versionId: string }> },
) {
  const auth = await requireProfile("admin");
  if ("response" in auth) return auth.response;
  const { examId, versionId } = await params;
  let orderedIds: string[];
  try {
    const input = (await request.json()) as { orderedIds?: unknown };
    orderedIds = Array.isArray(input.orderedIds)
      ? input.orderedIds.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return apiError("INVALID_JSON", "Dữ liệu JSON không hợp lệ.", 400);
  }
  try {
    const draft = await requireDraftVersion(examId, versionId);
    if ("error" in draft)
      return apiError("VERSION_IMMUTABLE", "Chỉ được sắp xếp bản nháp.", 409);
    const supabase = createSupabaseAdminClient();
    const { data: rows, error } = await supabase
      .from("questions")
      .select("id")
      .eq("exam_version_id", versionId);
    if (error) throw error;
    const actual = new Set((rows ?? []).map((row) => row.id));
    if (
      orderedIds.length !== actual.size ||
      orderedIds.some((id) => !actual.has(id)) ||
      new Set(orderedIds).size !== orderedIds.length
    ) {
      return apiError(
        "INVALID_ORDER",
        "Danh sách sắp xếp không khớp các câu hỏi.",
        422,
      );
    }
    await normalizeQuestionPositions(versionId, orderedIds);
    return Response.json({ data: { reordered: true } });
  } catch (error) {
    console.error("Reorder questions failed", error);
    return apiError("REORDER_FAILED", "Không thể sắp xếp câu hỏi.", 500);
  }
}
