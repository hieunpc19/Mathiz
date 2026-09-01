import { apiError, requireProfile } from "@/lib/api/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { mapExam, mapQuestion } from "@/lib/exams/data";
import { decryptAnswer } from "@/lib/exams/answer-crypto";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ examId: string }> },
) {
  const auth = await requireProfile("admin");
  if ("response" in auth) return auth.response;

  const { examId } = await params;
  const supabase = createSupabaseAdminClient();

  try {
    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select(
        "id, title, competition, round, school_year, grade_min, grade_max, languages, status, current_version_id, source_url, rights_note, created_at, updated_at",
      )
      .eq("id", examId)
      .maybeSingle();

    if (examError) throw examError;
    if (!exam) return apiError("EXAM_NOT_FOUND", "Không tìm thấy đề thi.", 404);

    let version = null;
    let questions: Array<
      ReturnType<typeof mapQuestion> & {
        correctAnswer: string;
        rawCorrectKeyEncrypted: boolean;
        pointsWrong: number;
        explanationMd: string;
        imagePaths: string[];
        tags: string[];
      }
    > = [];

    if (exam.current_version_id) {
      const { data: v, error: vError } = await supabase
        .from("exam_versions")
        .select(
          "id, version_no, duration_seconds, scoring_policy, raw_source_path, compiled_hash, published_at, created_at",
        )
        .eq("id", exam.current_version_id)
        .maybeSingle();

      if (vError) throw vError;
      version = v;

      const { data: questionRows, error: qError } = await supabase
        .from("questions")
        .select(
          "id, position, code, category, body_md, options, points_correct, points_wrong, correct_key, image_paths, tags, explanation_md",
        )
        .eq("exam_version_id", exam.current_version_id)
        .order("position");

      if (qError) throw qError;

      questions = (questionRows ?? []).map((q) => {
        let decryptedKey = "";
        try {
          decryptedKey = decryptAnswer(q.correct_key);
        } catch {
          decryptedKey = q.correct_key;
        }

        const mapped = mapQuestion(q, examId, exam.current_version_id);
        return {
          ...mapped,
          correctAnswer: decryptedKey,
          rawCorrectKeyEncrypted: q.correct_key.startsWith("enc:"),
          pointsWrong: Number(q.points_wrong ?? 0),
          explanationMd: q.explanation_md ?? "",
          imagePaths: Array.isArray(q.image_paths)
            ? (q.image_paths as string[])
            : [],
          tags: q.tags ?? [],
        };
      });
    }

    // Attempts count
    const { count: attemptCount } = await supabase
      .from("attempts")
      .select("*", { count: "exact", head: true })
      .eq("exam_version_id", exam.current_version_id);

    const examDetail = version ? mapExam(exam, version) : null;

    return Response.json({
      data: {
        exam: {
          ...exam,
          detail: examDetail,
          version,
          questions,
          attemptCount: attemptCount ?? 0,
        },
      },
    });
  } catch (error) {
    console.error("Admin get exam detail failed", error);
    return apiError("EXAM_FETCH_FAILED", "Không thể tải chi tiết đề thi.", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ examId: string }> },
) {
  const auth = await requireProfile("admin");
  if ("response" in auth) return auth.response;

  const { examId } = await params;
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return apiError(
      "INVALID_JSON",
      "Dữ liệu gửi lên không đúng định dạng JSON.",
      400,
    );
  }

  const supabase = createSupabaseAdminClient();

  const updates: Record<string, unknown> = {};
  if (typeof body.title === "string" && body.title.trim()) {
    updates.title = body.title.trim();
  }
  if (typeof body.competition === "string") {
    updates.competition = body.competition.trim();
  }
  if (body.status === "published") {
    return apiError(
      "VERSION_REQUIRED",
      "Hãy xuất bản một version đã vượt qua validation trong trình biên tập.",
      422,
    );
  }
  if (["draft", "archived"].includes(body.status as string)) {
    updates.status = body.status;
  }
  if (
    typeof body.gradeMin === "number" &&
    body.gradeMin >= 1 &&
    body.gradeMin <= 12
  ) {
    updates.grade_min = body.gradeMin;
  }
  if (
    typeof body.gradeMax === "number" &&
    body.gradeMax >= 1 &&
    body.gradeMax <= 12
  ) {
    updates.grade_max = body.gradeMax;
  }

  if (Object.keys(updates).length === 0) {
    return apiError("NO_CHANGES", "Không có trường nào cần cập nhật.", 422);
  }

  try {
    const { data, error } = await supabase
      .from("exams")
      .update(updates)
      .eq("id", examId)
      .select("id, title, competition, status, grade_min, grade_max")
      .single();

    if (error) throw error;

    return Response.json({
      data: {
        exam: data,
        message: "Cập nhật đề thi thành công.",
      },
    });
  } catch (error) {
    console.error("Admin update exam failed", error);
    return apiError("UPDATE_FAILED", "Không thể cập nhật đề thi.", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ examId: string }> },
) {
  const auth = await requireProfile("admin");
  if ("response" in auth) return auth.response;

  const { examId } = await params;
  const supabase = createSupabaseAdminClient();

  try {
    const { data: versions, error: versionsError } = await supabase
      .from("exam_versions")
      .select("id")
      .eq("exam_id", examId);
    if (versionsError) throw versionsError;
    const versionIds = (versions ?? []).map((version) => version.id);
    if (versionIds.length) {
      const { count: attemptCount, error: attemptsError } = await supabase
        .from("attempts")
        .select("*", { count: "exact", head: true })
        .in("exam_version_id", versionIds);
      if (attemptsError) throw attemptsError;
      if ((attemptCount ?? 0) > 0) {
        return apiError(
          "EXAM_HAS_ATTEMPTS",
          "Không thể xóa đề thi đã có lượt làm bài. Bạn có thể chuyển đề sang trạng thái lưu trữ.",
          409,
        );
      }

      const { data: assets, error: assetsError } = await supabase
        .from("assets")
        .select("storage_path")
        .in("exam_version_id", versionIds);
      if (assetsError) throw assetsError;
      if (assets?.length) {
        const { error: storageError } = await supabase.storage
          .from("exam-assets")
          .remove(assets.map((asset) => asset.storage_path));
        if (storageError) throw storageError;
      }
    }
    const { error } = await supabase.from("exams").delete().eq("id", examId);
    if (error) throw error;

    return Response.json({
      data: { success: true, message: "Đã xóa đề thi." },
    });
  } catch (error) {
    console.error("Admin delete exam failed", error);
    return apiError("DELETE_FAILED", "Không thể xóa đề thi này.", 500);
  }
}
