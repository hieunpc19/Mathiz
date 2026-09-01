import { apiError, requireProfile } from "@/lib/api/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const auth = await requireProfile("admin");
  if ("response" in auth) return auth.response;

  const url = new URL(request.url);
  const gradeParam = url.searchParams.get("grade");
  const searchParam = url.searchParams.get("search")?.toLowerCase().trim();

  const supabase = createSupabaseAdminClient();

  try {
    let query = supabase
      .from("profiles")
      .select("user_id, phone_number, display_name, role, grade, created_at, updated_at")
      .eq("role", "student")
      .order("created_at", { ascending: false });

    if (gradeParam && !isNaN(Number(gradeParam))) {
      query = query.eq("grade", Number(gradeParam));
    }

    const { data: students, error: studentsError } = await query;
    if (studentsError) throw studentsError;

    // Fetch attempt stats for these students
    const studentIds = (students ?? []).map((s) => s.user_id);
    const attemptsByStudent = new Map<string, Array<{ score: number | null; max_score: number | null; status: string; started_at: string }>>();

    if (studentIds.length > 0) {
      const { data: attempts } = await supabase
        .from("attempts")
        .select("student_id, score, max_score, status, started_at")
        .in("student_id", studentIds);

      (attempts ?? []).forEach((att) => {
        const list = attemptsByStudent.get(att.student_id) ?? [];
        list.push({
          score: att.score !== null ? Number(att.score) : null,
          max_score: att.max_score !== null ? Number(att.max_score) : null,
          status: att.status,
          started_at: att.started_at,
        });
        attemptsByStudent.set(att.student_id, list);
      });
    }

    const studentList = (students ?? []).map((s) => {
      const atts = attemptsByStudent.get(s.user_id) ?? [];
      const graded = atts.filter((a) => a.status === "graded" && a.score !== null && a.max_score);
      const avgScore = graded.length
        ? Math.round(
            (graded.reduce(
              (sum, cur) => sum + (Number(cur.score) / Number(cur.max_score)) * 100,
              0,
            ) /
              graded.length) *
              10,
          ) / 10
        : null;

      return {
        userId: s.user_id,
        displayName: s.display_name,
        phoneNumber: s.phone_number,
        grade: s.grade,
        createdAt: s.created_at,
        attemptsCount: atts.length,
        completedCount: graded.length,
        averageScore: avgScore,
      };
    });

    const filtered = searchParam
      ? studentList.filter(
          (s) =>
            s.displayName.toLowerCase().includes(searchParam) ||
            s.phoneNumber.toLowerCase().includes(searchParam),
        )
      : studentList;

    return Response.json({ data: { students: filtered } });
  } catch (error) {
    console.error("Admin list students failed", error);
    return apiError("STUDENTS_FETCH_FAILED", "Không thể lấy danh sách học sinh.", 500);
  }
}
