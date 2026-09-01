import { apiError, requireProfile } from "@/lib/api/auth";
import {
  loadVersionEditor,
  requireDraftVersion,
  versionMetadata,
} from "@/lib/exams/admin-versions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ examId: string; versionId: string }> },
) {
  const auth = await requireProfile("admin");
  if ("response" in auth) return auth.response;
  const { examId, versionId } = await params;
  try {
    const editor = await loadVersionEditor(examId, versionId);
    if (!editor)
      return apiError("VERSION_NOT_FOUND", "Không tìm thấy phiên bản đề.", 404);
    return Response.json({ data: { editor } });
  } catch (error) {
    console.error("Load version editor failed", error);
    return apiError("VERSION_FETCH_FAILED", "Không thể tải phiên bản đề.", 500);
  }
}

export async function PATCH(
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
    if ("error" in draft) {
      return draft.error === "not_found"
        ? apiError("VERSION_NOT_FOUND", "Không tìm thấy phiên bản.", 404)
        : apiError(
            "VERSION_IMMUTABLE",
            "Phiên bản đã xuất bản không thể chỉnh sửa.",
            409,
          );
    }
    const supabase = createSupabaseAdminClient();
    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select(
        "title,competition,round,school_year,grade_min,grade_max,languages,rights_note",
      )
      .eq("id", examId)
      .single();
    if (examError) throw examError;
    const currentMetadata = versionMetadata(exam, draft.version.scoring_policy);
    const supplied =
      input.metadata && typeof input.metadata === "object"
        ? (input.metadata as Record<string, unknown>)
        : {};
    const metadata = {
      ...currentMetadata,
      ...(typeof supplied.title === "string"
        ? { title: supplied.title.trim() }
        : {}),
      ...(typeof supplied.competition === "string"
        ? { competition: supplied.competition.trim() }
        : {}),
      ...(typeof supplied.round === "string" || supplied.round === null
        ? { round: supplied.round }
        : {}),
      ...(typeof supplied.schoolYear === "string" ||
      supplied.schoolYear === null
        ? { schoolYear: supplied.schoolYear }
        : {}),
      ...(typeof supplied.gradeMin === "number"
        ? { gradeMin: supplied.gradeMin }
        : {}),
      ...(typeof supplied.gradeMax === "number"
        ? { gradeMax: supplied.gradeMax }
        : {}),
      ...(Array.isArray(supplied.languages)
        ? {
            languages: supplied.languages.filter(
              (value): value is string => typeof value === "string",
            ),
          }
        : {}),
      ...(typeof supplied.rightsNote === "string" ||
      supplied.rightsNote === null
        ? { rightsNote: supplied.rightsNote }
        : {}),
    };
    const durationMinutes =
      input.durationMinutes === undefined
        ? Math.ceil((draft.version.duration_seconds ?? 0) / 60)
        : Number(input.durationMinutes);
    if (
      !metadata.title ||
      !Number.isInteger(durationMinutes) ||
      durationMinutes < 1 ||
      durationMinutes > 600
    ) {
      return apiError(
        "VALIDATION_ERROR",
        "Tên đề hoặc thời gian không hợp lệ.",
        422,
      );
    }
    if (
      !Number.isInteger(metadata.gradeMin) ||
      !Number.isInteger(metadata.gradeMax) ||
      metadata.gradeMin < 1 ||
      metadata.gradeMax > 12 ||
      metadata.gradeMin > metadata.gradeMax
    ) {
      return apiError("VALIDATION_ERROR", "Khoảng khối lớp không hợp lệ.", 422);
    }
    const { error } = await supabase
      .from("exam_versions")
      .update({
        duration_seconds: durationMinutes * 60,
        scoring_policy: {
          ...draft.version.scoring_policy,
          lifecycleStatus: "draft",
          examMetadata: metadata,
        },
      })
      .eq("id", versionId);
    if (error) throw error;
    return Response.json({ data: { saved: true, metadata, durationMinutes } });
  } catch (error) {
    console.error("Update exam version failed", error);
    return apiError(
      "VERSION_UPDATE_FAILED",
      "Không thể lưu cấu hình phiên bản.",
      500,
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ examId: string; versionId: string }> },
) {
  const auth = await requireProfile("admin");
  if ("response" in auth) return auth.response;
  const { examId, versionId } = await params;
  try {
    const draft = await requireDraftVersion(examId, versionId);
    if ("error" in draft)
      return apiError("VERSION_IMMUTABLE", "Chỉ được xóa bản nháp.", 409);
    const supabase = createSupabaseAdminClient();
    const { data: assets, error: assetError } = await supabase
      .from("assets")
      .select("storage_path")
      .eq("exam_version_id", versionId);
    if (assetError) throw assetError;
    if (assets?.length) {
      const { error: removeError } = await supabase.storage
        .from("exam-assets")
        .remove(assets.map((asset) => asset.storage_path));
      if (removeError) throw removeError;
    }
    const { error } = await supabase
      .from("exam_versions")
      .delete()
      .eq("id", versionId)
      .eq("exam_id", examId);
    if (error) throw error;
    return Response.json({ data: { deleted: true } });
  } catch (error) {
    console.error("Delete exam draft failed", error);
    return apiError("VERSION_DELETE_FAILED", "Không thể xóa bản nháp.", 500);
  }
}
