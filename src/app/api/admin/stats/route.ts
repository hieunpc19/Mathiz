import { apiError, requireProfile } from "@/lib/api/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireProfile("admin");
  if ("response" in auth) return auth.response;

  const supabase = createSupabaseAdminClient();

  try {
    const [
      { count: totalExamsCount },
      { count: publishedExamsCount },
      { count: draftExamsCount },
      { count: totalQuestionsCount },
      { count: totalStudentsCount },
      { data: attempts, error: attemptsError },
      { data: exams, error: examsError },
      { data: profiles, error: profilesError },
    ] = await Promise.all([
      supabase.from("exams").select("*", { count: "exact", head: true }),
      supabase
        .from("exams")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("exams")
        .select("*", { count: "exact", head: true })
        .eq("status", "draft"),
      supabase.from("questions").select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "student"),
      supabase
        .from("attempts")
        .select(
          "id, student_id, exam_version_id, status, started_at, submitted_at, score, max_score, duration_seconds",
        )
        .order("started_at", { ascending: false })
        .limit(20),
      supabase
        .from("exams")
        .select(
          "id, title, competition, grade_min, grade_max, status, created_at, current_version_id",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("user_id, display_name, phone_number, grade")
        .eq("role", "student"),
    ]);

    if (attemptsError) throw attemptsError;
    if (examsError) throw examsError;
    if (profilesError) throw profilesError;

    const examMap = new Map((exams ?? []).map((e) => [e.id, e]));
    const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));

    // Fetch version exam_id mapping for recent attempts
    const versionIds = [
      ...new Set((attempts ?? []).map((a) => a.exam_version_id)),
    ];
    let versionExamMap = new Map<string, string>();
    if (versionIds.length > 0) {
      const { data: versions } = await supabase
        .from("exam_versions")
        .select("id, exam_id")
        .in("id", versionIds);
      versionExamMap = new Map(
        (versions ?? []).map((v) => [v.id, v.exam_id as string]),
      );
    }

    const recentAttempts = (attempts ?? []).slice(0, 8).map((att) => {
      const examId = versionExamMap.get(att.exam_version_id);
      const exam = examId ? examMap.get(examId) : null;
      const student = profileMap.get(att.student_id);

      return {
        id: att.id,
        studentName: student?.display_name ?? "Học sinh",
        studentPhone: student?.phone_number ?? "",
        studentGrade: student?.grade ?? null,
        examTitle: exam?.title ?? "Đề thi Olympic",
        competition: exam?.competition ?? "Olympic",
        status: att.status,
        startedAt: att.started_at,
        submittedAt: att.submitted_at,
        score: att.score !== null ? Number(att.score) : null,
        maxScore: att.max_score !== null ? Number(att.max_score) : null,
        durationSeconds: att.duration_seconds,
      };
    });

    const gradedAttempts = (attempts ?? []).filter(
      (a) => a.status === "graded" && a.score !== null && a.max_score,
    );
    const avgScorePct = gradedAttempts.length
      ? Math.round(
          (gradedAttempts.reduce(
            (acc, curr) =>
              acc + (Number(curr.score) / Number(curr.max_score)) * 100,
            0,
          ) /
            gradedAttempts.length) *
            10,
        ) / 10
      : 0;

    return Response.json({
      data: {
        stats: {
          totalExams: totalExamsCount ?? 0,
          publishedExams: publishedExamsCount ?? 0,
          draftExams: draftExamsCount ?? 0,
          totalQuestions: totalQuestionsCount ?? 0,
          totalStudents: totalStudentsCount ?? 0,
          totalAttempts: (attempts ?? []).length,
          completedAttempts: gradedAttempts.length,
          averageScorePercent: avgScorePct,
        },
        recentAttempts,
      },
    });
  } catch (error) {
    console.error("Admin stats failed", error);
    return apiError("STATS_FAILED", "Không thể lấy số liệu thống kê.", 500);
  }
}
