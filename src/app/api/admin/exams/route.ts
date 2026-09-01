import { apiError, requireProfile } from "@/lib/api/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { mapExam } from "@/lib/exams/data";

export async function GET(request: Request) {
  const auth = await requireProfile("admin");
  if ("response" in auth) return auth.response;

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status");
  const searchFilter = url.searchParams.get("search")?.toLowerCase().trim();

  const supabase = createSupabaseAdminClient();

  try {
    let query = supabase
      .from("exams")
      .select(
        "id, title, competition, round, school_year, grade_min, grade_max, languages, status, current_version_id, created_at, updated_at",
      )
      .order("created_at", { ascending: false });

    if (statusFilter && ["draft", "published", "archived"].includes(statusFilter)) {
      query = query.eq("status", statusFilter);
    }

    const { data: exams, error: examsError } = await query;
    if (examsError) throw examsError;

    // Fetch version details and attempt counts for each exam
    const examList = await Promise.all(
      (exams ?? []).map(async (exam) => {
        let versionInfo = null;
        let questionCount = 0;
        let attemptCount = 0;

        let displayVersionId = exam.current_version_id;
        if (!displayVersionId) {
          const { data: latestVersion } = await supabase
            .from("exam_versions")
            .select("id")
            .eq("exam_id", exam.id)
            .order("version_no", { ascending: false })
            .limit(1)
            .maybeSingle();
          displayVersionId = latestVersion?.id ?? null;
        }

        if (displayVersionId) {
          const { data: version } = await supabase
            .from("exam_versions")
            .select("id, version_no, duration_seconds, scoring_policy, created_at")
            .eq("id", displayVersionId)
            .maybeSingle();

          if (version) {
            versionInfo = version;
            const scoring = (version.scoring_policy as Record<string, unknown>) ?? {};
            questionCount = typeof scoring.questionCount === "number" ? scoring.questionCount : 0;
          }

          // Count attempts for this version
          const { count } = await supabase
            .from("attempts")
            .select("*", { count: "exact", head: true })
            .eq("exam_version_id", displayVersionId);
          attemptCount = count ?? 0;
        }

        const mapped = versionInfo
          ? mapExam(exam, versionInfo)
          : {
              id: exam.id,
              title: exam.title,
              subtitle: exam.competition ?? "Đề Toán",
              competition: exam.competition ?? "TIMO",
              grade: exam.grade_min ?? 1,
              gradeMin: exam.grade_min ?? 1,
              gradeMax: exam.grade_max ?? 5,
              gradeLabel:
                exam.grade_min === exam.grade_max
                  ? `Lớp ${exam.grade_min}`
                  : `Lớp ${exam.grade_min}–${exam.grade_max}`,
              durationMinutes: 90,
              totalQuestions: 0,
              totalPoints: 100,
              difficulty: "Phù hợp tiểu học",
              description: "",
              status: exam.status,
              round: exam.round,
              schoolYear: exam.school_year,
              languages: exam.languages,
              rules: [],
            };

        return {
          ...mapped,
          createdAt: exam.created_at,
          updatedAt: exam.updated_at,
          currentVersionId: exam.current_version_id,
          versionNo: versionInfo?.version_no ?? 1,
          questionCount,
          attemptCount,
        };
      }),
    );

    const filtered = searchFilter
      ? examList.filter(
          (e) =>
            e.title.toLowerCase().includes(searchFilter) ||
            e.competition.toLowerCase().includes(searchFilter) ||
            e.subtitle.toLowerCase().includes(searchFilter),
        )
      : examList;

    return Response.json({ data: { exams: filtered } });
  } catch (error) {
    console.error("Admin list exams failed", error);
    return apiError("EXAMS_FETCH_FAILED", "Không thể lấy danh sách đề thi.", 500);
  }
}
