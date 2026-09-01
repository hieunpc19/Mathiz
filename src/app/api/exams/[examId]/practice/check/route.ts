import { apiError, requireProfile } from "@/lib/api/auth";
import { decryptAnswer } from "@/lib/exams/answer-crypto";
import { getExamAndVersion } from "@/lib/exams/data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ examId: string }> },
) {
  const auth = await requireProfile();
  if ("response" in auth) return auth.response;
  const { examId } = await params;

  try {
    const body = (await request.json()) as {
      questionId?: string;
      selectedKey?: string;
    };

    const { questionId, selectedKey } = body;
    if (!questionId || typeof questionId !== "string" || !selectedKey || typeof selectedKey !== "string") {
      return apiError("INVALID_PAYLOAD", "Dữ liệu câu hỏi hoặc đáp án không hợp lệ.", 400);
    }

    const current = await getExamAndVersion(examId);
    if (!current || (current.exam.status !== "published" && auth.profile.role !== "admin")) {
      return apiError("EXAM_NOT_FOUND", "Không tìm thấy đề thi.", 404);
    }

    const supabase = createSupabaseAdminClient();
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("id, correct_key")
      .eq("id", questionId)
      .eq("exam_version_id", current.version.id)
      .maybeSingle();

    if (questionError) throw questionError;
    if (!question) {
      return apiError("QUESTION_NOT_FOUND", "Không tìm thấy câu hỏi trong đề thi này.", 404);
    }

    const correctKey = decryptAnswer(question.correct_key);
    const isCorrect = selectedKey === correctKey;

    return Response.json({
      data: {
        isCorrect,
      },
    });
  } catch (error) {
    console.error("Practice check answer failed", error);
    return apiError("CHECK_FAILED", "Không thể kiểm tra đáp án.", 500);
  }
}
