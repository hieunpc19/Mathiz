import { apiError, requireProfile } from "@/lib/api/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireProfile();
  if ("response" in auth) return auth.response;

  const supabase = createSupabaseAdminClient();
  const userId = auth.profile.userId;

  try {
    // 1. Fetch full student profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, phone_number, display_name, role, grade, created_at, updated_at")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return apiError("PROFILE_NOT_FOUND", "Không tìm thấy hồ sơ người dùng.", 404);
    }

    // 2. Fetch all attempts by this student
    const { data: attempts, error: attemptsError } = await supabase
      .from("attempts")
      .select("id, exam_version_id, status, score, max_score, duration_seconds, started_at, submitted_at")
      .eq("student_id", userId)
      .order("started_at", { ascending: false });

    if (attemptsError) throw attemptsError;

    // 3. Fetch exams related to these attempt versions
    const versionIds = Array.from(new Set((attempts ?? []).map((a) => a.exam_version_id)));
    const examMap = new Map<
      string,
      {
        examId: string;
        title: string;
        subtitle: string;
        competition: string;
        gradeLabel: string;
      }
    >();

    if (versionIds.length > 0) {
      const { data: versions } = await supabase
        .from("exam_versions")
        .select("id, exam_id, scoring_policy, exams(id, title, competition, grade_min, grade_max)")
        .in("id", versionIds);

      (versions ?? []).forEach((v) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawExam = v.exams as any;
        const metadata = (v.scoring_policy as Record<string, unknown>) ?? {};
        const examMetadata =
          metadata.examMetadata && typeof metadata.examMetadata === "object"
            ? (metadata.examMetadata as Record<string, unknown>)
            : {};

        const title =
          typeof examMetadata.title === "string"
            ? examMetadata.title
            : rawExam?.title ?? "Đề thi Olympic";

        const competition =
          typeof examMetadata.competition === "string"
            ? examMetadata.competition
            : rawExam?.competition ?? "Olympic";

        const subtitle =
          typeof metadata.subtitle === "string"
            ? (metadata.subtitle as string)
            : competition;

        const gradeMin =
          typeof examMetadata.gradeMin === "number"
            ? (examMetadata.gradeMin as number)
            : rawExam?.grade_min ?? 1;

        const gradeMax =
          typeof examMetadata.gradeMax === "number"
            ? (examMetadata.gradeMax as number)
            : rawExam?.grade_max ?? gradeMin;

        const gradeLabel =
          gradeMin === gradeMax ? `Lớp ${gradeMin}` : `Lớp ${gradeMin}–${gradeMax}`;

        examMap.set(v.id, {
          examId: v.exam_id,
          title,
          subtitle,
          competition,
          gradeLabel,
        });
      });
    }

    // 4. Calculate learning metrics
    const allAttempts = attempts ?? [];
    const totalAttempts = allAttempts.length;
    const completedAttempts = allAttempts.filter(
      (a) =>
        (a.status === "submitted" || a.status === "graded") &&
        a.score !== null &&
        a.max_score !== null &&
        Number(a.max_score) > 0,
    );

    let totalScorePercentSum = 0;
    let highestScoreRecord: {
      score: number;
      maxScore: number;
      percent: number;
      examTitle: string;
    } | null = null;

    let totalTimeSpentSeconds = 0;

    allAttempts.forEach((a) => {
      if (a.duration_seconds) {
        totalTimeSpentSeconds += a.duration_seconds;
      }
    });

    completedAttempts.forEach((a) => {
      const score = Number(a.score);
      const maxScore = Number(a.max_score);
      const percent = Math.round((score / maxScore) * 100);
      totalScorePercentSum += percent;

      if (!highestScoreRecord || percent > highestScoreRecord.percent) {
        const examInfo = examMap.get(a.exam_version_id);
        highestScoreRecord = {
          score,
          maxScore,
          percent,
          examTitle: examInfo?.title ?? "Đề thi Olympic",
        };
      }
    });

    const averageScorePercent =
      completedAttempts.length > 0
        ? Math.round(totalScorePercentSum / completedAttempts.length)
        : 0;

    // 5. Format recent attempts
    const recentAttempts = allAttempts.slice(0, 20).map((a) => {
      const examInfo = examMap.get(a.exam_version_id);
      const score = a.score !== null ? Number(a.score) : null;
      const maxScore = a.max_score !== null ? Number(a.max_score) : null;
      const percent =
        score !== null && maxScore !== null && maxScore > 0
          ? Math.round((score / maxScore) * 100)
          : null;

      return {
        id: a.id,
        examId: examInfo?.examId ?? "",
        examTitle: examInfo?.title ?? "Đề thi Olympic",
        examSubtitle: examInfo?.subtitle ?? "",
        competition: examInfo?.competition ?? "Olympic",
        gradeLabel: examInfo?.gradeLabel ?? "",
        status: a.status,
        score,
        maxScore,
        percent,
        durationSeconds: a.duration_seconds,
        startedAt: a.started_at,
        submittedAt: a.submitted_at,
      };
    });

    return Response.json({
      data: {
        profile: {
          userId: profile.user_id,
          phoneNumber: profile.phone_number,
          displayName: profile.display_name,
          role: profile.role,
          grade: profile.grade,
          createdAt: profile.created_at,
        },
        stats: {
          totalAttempts,
          completedAttempts: completedAttempts.length,
          averageScorePercent,
          highestScore: highestScoreRecord,
          totalTimeSpentSeconds,
        },
        recentAttempts,
      },
    });
  } catch (error) {
    console.error("Student profile fetch error:", error);
    return apiError("INTERNAL_ERROR", "Không thể tải hồ sơ học sinh.", 500);
  }
}

export async function PATCH(request: Request) {
  const auth = await requireProfile();
  if ("response" in auth) return auth.response;

  const supabase = createSupabaseAdminClient();
  const userId = auth.profile.userId;

  try {
    const body = await request.json();
    const { displayName, grade, newPassword } = body;

    const updates: { display_name?: string; grade?: number | null; updated_at?: string } = {};

    if (displayName !== undefined) {
      const trimmed = String(displayName).trim();
      if (trimmed.length < 1 || trimmed.length > 120) {
        return apiError("INVALID_NAME", "Tên hiển thị phải từ 1 đến 120 ký tự.", 400);
      }
      updates.display_name = trimmed;
    }

    if (grade !== undefined) {
      const parsedGrade = Number(grade);
      if (isNaN(parsedGrade) || parsedGrade < 1 || parsedGrade > 12) {
        return apiError("INVALID_GRADE", "Khối lớp không hợp lệ (từ lớp 1 đến lớp 12).", 400);
      }
      updates.grade = parsedGrade;
    }

    // If new password is provided, update via Supabase Admin Auth API
    if (newPassword !== undefined && newPassword !== "") {
      const pwd = String(newPassword);
      if (pwd.length < 8) {
        return apiError("INVALID_PASSWORD", "Mật khẩu mới phải có ít nhất 8 ký tự.", 400);
      }
      const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
        password: pwd,
      });
      if (authError) {
        console.error("Password update error:", authError);
        return apiError("PASSWORD_UPDATE_FAILED", "Không thể cập nhật mật khẩu.", 500);
      }
    }

    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString();
      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", userId)
        .select("user_id, phone_number, display_name, role, grade, created_at, updated_at")
        .single();

      if (updateError || !updatedProfile) {
        console.error("Profile update error:", updateError);
        return apiError("UPDATE_FAILED", "Không thể cập nhật thông tin hồ sơ.", 500);
      }

      return Response.json({
        data: {
          profile: {
            userId: updatedProfile.user_id,
            phoneNumber: updatedProfile.phone_number,
            displayName: updatedProfile.display_name,
            role: updatedProfile.role,
            grade: updatedProfile.grade,
            createdAt: updatedProfile.created_at,
          },
          message: "Cập nhật hồ sơ thành công.",
        },
      });
    }

    return Response.json({
      data: {
        message: "Cập nhật thành công.",
      },
    });
  } catch (error) {
    console.error("Student profile update error:", error);
    return apiError("INTERNAL_ERROR", "Không thể cập nhật hồ sơ.", 500);
  }
}
