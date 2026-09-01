import { apiError, requireProfile } from "@/lib/api/auth";
import {
  requireDraftVersion,
  validateVersionForPublish,
} from "@/lib/exams/admin-versions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ examId: string; versionId: string }> },
) {
  const auth = await requireProfile("admin");
  if ("response" in auth) return auth.response;
  const { examId, versionId } = await params;
  try {
    const draft = await requireDraftVersion(examId, versionId);
    if ("error" in draft)
      return apiError(
        "VERSION_IMMUTABLE",
        "Phiên bản không phải bản nháp.",
        409,
      );
    const { editor, issues } = await validateVersionForPublish(
      examId,
      versionId,
    );
    if (!editor)
      return apiError("VERSION_NOT_FOUND", "Không tìm thấy phiên bản.", 404);
    if (issues.length) {
      return Response.json(
        {
          error: {
            code: "PUBLISH_VALIDATION_FAILED",
            message: "Bản nháp chưa đủ điều kiện xuất bản.",
            issues,
          },
        },
        { status: 422 },
      );
    }
    const supabase = createSupabaseAdminClient();
    const metadata = editor.version.metadata;
    const publishedAt = new Date().toISOString();
    const scoring = {
      ...draft.version.scoring_policy,
      lifecycleStatus: "published",
      questionCount: editor.questions.length,
      maxScore: editor.questions.reduce(
        (sum, question) => sum + question.points,
        0,
      ),
    };
    const { error: versionError } = await supabase
      .from("exam_versions")
      .update({ scoring_policy: scoring, published_at: publishedAt })
      .eq("id", versionId);
    if (versionError) throw versionError;
    const { error: examError } = await supabase
      .from("exams")
      .update({
        title: metadata.title,
        competition: metadata.competition,
        round: metadata.round,
        school_year: metadata.schoolYear,
        grade_min: metadata.gradeMin,
        grade_max: metadata.gradeMax,
        languages: metadata.languages,
        rights_note: metadata.rightsNote,
        current_version_id: versionId,
        status: "published",
      })
      .eq("id", examId);
    if (examError) {
      await supabase
        .from("exam_versions")
        .update({
          scoring_policy: { ...scoring, lifecycleStatus: "draft" },
          published_at: null,
        })
        .eq("id", versionId);
      throw examError;
    }
    return Response.json({ data: { published: true, publishedAt, versionId } });
  } catch (error) {
    console.error("Publish exam version failed", error);
    return apiError("PUBLISH_FAILED", "Không thể xuất bản phiên bản đề.", 500);
  }
}
