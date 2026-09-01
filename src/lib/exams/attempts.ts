import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAttemptExam, mapQuestion } from "@/lib/exams/data";
import type { AttemptData, AttemptResult, ResultQuestion } from "@/lib/exams/types";
import { decryptAnswer } from "@/lib/exams/answer-crypto";

export async function getOwnedAttempt(attemptId: string, userId: string, isAdmin = false) {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("attempts")
    .select(
      "id,student_id,exam_version_id,status,started_at,deadline_at,submitted_at,score,max_score,duration_seconds",
    )
    .eq("id", attemptId);
  if (!isAdmin) query = query.eq("student_id", userId);
  const { data: attempt, error } = await query.maybeSingle();
  if (error) throw error;
  return attempt;
}

async function examIdForVersion(versionId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("exam_versions")
    .select("exam_id")
    .eq("id", versionId)
    .single();
  if (error) throw error;
  return data.exam_id as string;
}

export async function loadAttempt(
  attemptId: string,
  userId: string,
  isAdmin = false,
): Promise<AttemptData | null> {
  const attempt = await getOwnedAttempt(attemptId, userId, isAdmin);
  if (!attempt) return null;
  const supabase = createSupabaseAdminClient();
  const examId = await examIdForVersion(attempt.exam_version_id);
  const exam = await getAttemptExam(examId, attempt.exam_version_id);
  if (!exam) return null;
  const { data: savedAnswers, error } = await supabase
    .from("attempt_answers")
    .select("question_id,selected_key")
    .eq("attempt_id", attemptId);
  if (error) throw error;
  return {
    id: attempt.id,
    status: attempt.status,
    startedAt: attempt.started_at,
    deadlineAt: attempt.deadline_at,
    answers: Object.fromEntries(
      (savedAnswers ?? [])
        .filter((answer) => answer.selected_key !== null)
        .map((answer) => [answer.question_id, answer.selected_key as string]),
    ),
    exam,
  };
}

export async function saveAttemptAnswer(
  attemptId: string,
  userId: string,
  questionId: string,
  selectedKey: string | null,
) {
  const supabase = createSupabaseAdminClient();
  const attempt = await getOwnedAttempt(attemptId, userId);
  if (!attempt) return { status: "not_found" as const };
  if (attempt.status !== "in_progress") return { status: "closed" as const };
  if (attempt.deadline_at && Date.parse(attempt.deadline_at) <= Date.now()) {
    return { status: "expired" as const };
  }

  const { data: question, error: questionError } = await supabase
    .from("questions")
    .select("id,options")
    .eq("id", questionId)
    .eq("exam_version_id", attempt.exam_version_id)
    .maybeSingle();
  if (questionError) throw questionError;
  if (!question) return { status: "invalid_question" as const };

  const options = Array.isArray(question.options)
    ? (question.options as Array<{ id?: unknown }>).map((option) => option.id)
    : [];
  if (selectedKey !== null && !options.includes(selectedKey)) {
    return { status: "invalid_answer" as const };
  }

  const { error } = await supabase.from("attempt_answers").upsert(
    {
      attempt_id: attemptId,
      question_id: questionId,
      selected_key: selectedKey,
      answered_at: selectedKey ? new Date().toISOString() : null,
      is_correct: null,
      awarded_points: null,
    },
    { onConflict: "attempt_id,question_id" },
  );
  if (error) throw error;
  return { status: "saved" as const };
}

export async function submitAttempt(
  attemptId: string,
  userId: string,
  requestedReason: "manual" | "timeout" = "manual",
) {
  const supabase = createSupabaseAdminClient();
  const attempt = await getOwnedAttempt(attemptId, userId);
  if (!attempt) return { status: "not_found" as const };
  if (attempt.status !== "in_progress") return { status: "already_submitted" as const };
  const submitReason =
    attempt.deadline_at && Date.parse(attempt.deadline_at) <= Date.now()
      ? "timeout"
      : requestedReason;

  const [{ data: questions, error: questionsError }, { data: answers, error: answersError }] =
    await Promise.all([
      supabase
        .from("questions")
        .select("id,correct_key,points_correct")
        .eq("exam_version_id", attempt.exam_version_id),
      supabase
        .from("attempt_answers")
        .select("question_id,selected_key")
        .eq("attempt_id", attemptId),
    ]);
  if (questionsError) throw questionsError;
  if (answersError) throw answersError;

  const answerMap = new Map((answers ?? []).map((answer) => [answer.question_id, answer]));
  let score = 0;
  let maxScore = 0;
  const gradedAnswers = (questions ?? []).map((question) => {
    const answer = answerMap.get(question.id);
    const isCorrect =
      Boolean(answer?.selected_key) && answer?.selected_key === decryptAnswer(question.correct_key);
    const points = isCorrect ? Number(question.points_correct) : 0;
    score += points;
    maxScore += Number(question.points_correct);
    return {
      attempt_id: attemptId,
      question_id: question.id,
      selected_key: answer?.selected_key ?? null,
      answered_at: answer?.selected_key ? new Date().toISOString() : null,
      is_correct: isCorrect,
      awarded_points: points,
    };
  });

  const submittedAt = new Date().toISOString();
  const durationSeconds = Math.max(
    0,
    Math.round((Date.parse(submittedAt) - Date.parse(attempt.started_at)) / 1000),
  );
  const { error: gradingError } = await supabase
    .from("attempt_answers")
    .upsert(gradedAnswers, { onConflict: "attempt_id,question_id" });
  if (gradingError) throw gradingError;
  const { data: updated, error: updateError } = await supabase
    .from("attempts")
    .update({
      status: "graded",
      submitted_at: submittedAt,
      score,
      max_score: maxScore,
      duration_seconds: durationSeconds,
      submit_reason: submitReason,
    })
    .eq("id", attemptId)
    .eq("status", "in_progress")
    .select("id")
    .maybeSingle();
  if (updateError) throw updateError;
  return { status: updated ? ("submitted" as const) : ("already_submitted" as const) };
}

export async function loadAttemptResult(
  attemptId: string,
  userId: string,
  isAdmin = false,
): Promise<AttemptResult | null | "in_progress"> {
  const attempt = await getOwnedAttempt(attemptId, userId, isAdmin);
  if (!attempt) return null;
  if (attempt.status === "in_progress") return "in_progress";
  const supabase = createSupabaseAdminClient();
  const examId = await examIdForVersion(attempt.exam_version_id);
  const exam = await getAttemptExam(examId, attempt.exam_version_id);
  if (!exam) return null;
  const [{ data: questionRows, error: questionError }, { data: answerRows, error: answerError }] =
    await Promise.all([
      supabase
        .from("questions")
        .select(
          "id,position,code,category,body_md,options,points_correct,correct_key,explanation_md",
        )
        .eq("exam_version_id", attempt.exam_version_id)
        .order("position"),
      supabase
        .from("attempt_answers")
        .select("question_id,selected_key,is_correct,awarded_points")
        .eq("attempt_id", attemptId),
    ]);
  if (questionError) throw questionError;
  if (answerError) throw answerError;
  const answers = new Map((answerRows ?? []).map((answer) => [answer.question_id, answer]));
  const questions: ResultQuestion[] = (questionRows ?? []).map((row) => {
    const answer = answers.get(row.id);
    return {
      ...mapQuestion(row, examId, attempt.exam_version_id),
      selectedAnswer: answer?.selected_key ?? null,
      correctAnswer: decryptAnswer(row.correct_key),
      isCorrect: answer?.is_correct ?? false,
      awardedPoints: Number(answer?.awarded_points ?? 0),
      explanationMd:
        row.explanation_md?.trim() || "Tài liệu nguồn không cung cấp lời giải chi tiết.",
    };
  });
  const correctCount = questions.filter((question) => question.isCorrect).length;
  const skippedCount = questions.filter((question) => !question.selectedAnswer).length;
  return {
    attemptId,
    status: attempt.status,
    submittedAt: attempt.submitted_at,
    score: Number(attempt.score ?? 0),
    maxScore: Number(attempt.max_score ?? exam.totalPoints),
    correctCount,
    wrongCount: questions.length - correctCount - skippedCount,
    skippedCount,
    exam,
    questions,
  };
}
