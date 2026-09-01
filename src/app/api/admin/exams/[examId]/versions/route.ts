import { apiError, requireProfile } from "@/lib/api/auth";
import { cloneVersion, versionMetadata } from "@/lib/exams/admin-versions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ examId: string }> },
) {
  const auth = await requireProfile("admin");
  if ("response" in auth) return auth.response;
  const { examId } = await params;
  const supabase = createSupabaseAdminClient();
  try {
    const [
      { data: exam, error: examError },
      { data: versions, error: versionsError },
    ] = await Promise.all([
      supabase
        .from("exams")
        .select(
          "id,title,competition,round,school_year,grade_min,grade_max,languages,rights_note,current_version_id",
        )
        .eq("id", examId)
        .maybeSingle(),
      supabase
        .from("exam_versions")
        .select(
          "id,version_no,duration_seconds,scoring_policy,published_at,created_at,raw_source_path",
        )
        .eq("exam_id", examId)
        .order("version_no", { ascending: false }),
    ]);
    if (examError) throw examError;
    if (versionsError) throw versionsError;
    if (!exam) return apiError("EXAM_NOT_FOUND", "Không tìm thấy đề thi.", 404);
    return Response.json({
      data: {
        versions: (versions ?? []).map((version) => {
          const scoring = (version.scoring_policy ?? {}) as Record<
            string,
            unknown
          >;
          return {
            id: version.id,
            versionNo: version.version_no,
            lifecycle: version.published_at ? "published" : "draft",
            isCurrent: exam.current_version_id === version.id,
            durationMinutes: Math.ceil((version.duration_seconds ?? 0) / 60),
            questionCount: Number(scoring.questionCount ?? 0),
            maxScore: Number(scoring.maxScore ?? 0),
            metadata: versionMetadata(exam, scoring),
            sourcePath: version.raw_source_path,
            publishedAt: version.published_at,
            createdAt: version.created_at,
          };
        }),
      },
    });
  } catch (error) {
    console.error("List exam versions failed", error);
    return apiError(
      "VERSIONS_FETCH_FAILED",
      "Không thể tải các phiên bản đề.",
      500,
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ examId: string }> },
) {
  const auth = await requireProfile("admin");
  if ("response" in auth) return auth.response;
  const { examId } = await params;
  let sourceVersionId = "";
  try {
    const input = (await request.json()) as { sourceVersionId?: unknown };
    if (typeof input.sourceVersionId === "string")
      sourceVersionId = input.sourceVersionId;
  } catch {
    return apiError("INVALID_JSON", "Dữ liệu JSON không hợp lệ.", 400);
  }
  if (!sourceVersionId)
    return apiError("VALIDATION_ERROR", "Thiếu phiên bản nguồn.", 422);
  try {
    const result = await cloneVersion(
      examId,
      sourceVersionId,
      auth.profile.userId,
    );
    return Response.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error("Clone exam version failed", error);
    return apiError(
      "CLONE_FAILED",
      error instanceof Error ? error.message : "Không thể tạo bản nháp.",
      500,
    );
  }
}
