import { apiError, requireProfile } from "@/lib/api/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const auth = await requireProfile("admin");
  if ("response" in auth) return auth.response;

  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status");
  const studentParam = url.searchParams.get("studentId");
  const searchParam = url.searchParams.get("search")?.toLowerCase().trim();

  const supabase = createSupabaseAdminClient();

  try {
    let query = supabase
      .from("attempts")
      .select(
        "id, student_id, exam_version_id, status, started_at, deadline_at, submitted_at, score, max_score, duration_seconds, submit_reason",
      )
      .order("started_at", { ascending: false });

    if (statusParam && ["in_progress", "submitted", "graded", "abandoned"].includes(statusParam)) {
      query = query.eq("status", statusParam);
    }
    if (studentParam) {
      query = query.eq("student_id", studentParam);
    }

    const { data: attempts, error: attemptsError } = await query;
    if (attemptsError) throw attemptsError;

    // Fetch related exams and student profiles
    const studentIds = [...new Set((attempts ?? []).map((a) => a.student_id))];
    const versionIds = [...new Set((attempts ?? []).map((a) => a.exam_version_id))];

    const [{ data: profiles }, { data: versions }] = await Promise.all([
      studentIds.length > 0
        ? supabase.from("profiles").select("user_id, display_name, phone_number, grade").in("user_id", studentIds)
        : Promise.resolve({ data: [] }),
      versionIds.length > 0
        ? supabase.from("exam_versions").select("id, exam_id, version_no").in("id", versionIds)
        : Promise.resolve({ data: [] }),
    ]);

    const examIds = [...new Set((versions ?? []).map((v) => v.exam_id))];
    const { data: exams } =
      examIds.length > 0
        ? await supabase.from("exams").select("id, title, competition, grade_min, grade_max").in("id", examIds)
        : { data: [] };

    const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));
    const versionMap = new Map((versions ?? []).map((v) => [v.id, v]));
    const examMap = new Map((exams ?? []).map((e) => [e.id, e]));

    const formatted = (attempts ?? []).map((att) => {
      const student = profileMap.get(att.student_id);
      const version = versionMap.get(att.exam_version_id);
      const exam = version ? examMap.get(version.exam_id) : null;

      return {
        id: att.id,
        studentId: att.student_id,
        studentName: student?.display_name ?? "Học sinh",
        studentPhone: student?.phone_number ?? "",
        studentGrade: student?.grade ?? null,
        examId: exam?.id ?? null,
        examTitle: exam?.title ?? "Đề thi",
        competition: exam?.competition ?? "Olympic",
        versionNo: version?.version_no ?? 1,
        status: att.status,
        startedAt: att.started_at,
        deadlineAt: att.deadline_at,
        submittedAt: att.submitted_at,
        score: att.score !== null ? Number(att.score) : null,
        maxScore: att.max_score !== null ? Number(att.max_score) : null,
        durationSeconds: att.duration_seconds,
        submitReason: att.submit_reason,
      };
    });

    const filtered = searchParam
      ? formatted.filter(
          (a) =>
            a.studentName.toLowerCase().includes(searchParam) ||
            a.studentPhone.toLowerCase().includes(searchParam) ||
            a.examTitle.toLowerCase().includes(searchParam) ||
            a.competition.toLowerCase().includes(searchParam),
        )
      : formatted;

    return Response.json({ data: { attempts: filtered } });
  } catch (error) {
    console.error("Admin list attempts failed", error);
    return apiError("ATTEMPTS_FETCH_FAILED", "Không thể lấy danh sách lượt làm bài.", 500);
  }
}
