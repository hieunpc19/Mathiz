"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, LoaderCircle, Pencil } from "lucide-react";
import type { AttemptData } from "@/lib/exams/types";
import { ExamHeader } from "@/components/quiz/exam-header";
import { QuestionCard } from "@/components/quiz/question-card";
import { QuestionNavigator } from "@/components/quiz/question-navigator";
import { Scratchpad } from "@/components/quiz/scratchpad";
import { SubmitModal } from "@/components/quiz/submit-modal";

export default function StudentAttemptPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(params);
  const router = useRouter();
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isScratchpadDocked, setIsScratchpadDocked] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pendingSaves = useRef(new Set<Promise<void>>());

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch(`/api/attempts/${attemptId}`, { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Không thể tải lượt thi.");
        const loaded = payload.data.attempt as AttemptData;
        if (loaded.status !== "in_progress") {
          router.replace(`/student/results/${attemptId}`);
          return;
        }
        setAttempt(loaded);
        setAnswers(loaded.answers);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không thể tải lượt thi.");
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId, router]);

  const saveAnswer = useCallback((questionId: string, selectedKey: string | null) => {
    const operation = (async () => {
      const response = await fetch(`/api/attempts/${attemptId}/answers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, selectedKey }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Không thể lưu đáp án.");
      setLastSavedAt(new Date());
    })()
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Không thể lưu đáp án."))
      .finally(() => pendingSaves.current.delete(operation));
    pendingSaves.current.add(operation);
  }, [attemptId]);

  const submit = useCallback(async (reason: "manual" | "timeout" = "manual") => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await Promise.all([...pendingSaves.current]);
      const response = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Không thể nộp bài.");
      router.replace(`/student/results/${attemptId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể nộp bài.");
      setIsSubmitting(false);
    }
  }, [attemptId, isSubmitting, router]);

  if (loading) return <div className="flex min-h-screen items-center justify-center gap-2 bg-slate-100 text-slate-600"><LoaderCircle className="h-6 w-6 animate-spin" /> Đang tải bài thi...</div>;
  if (!attempt) return <div className="min-h-screen bg-slate-100 p-10 text-center text-rose-700">{error ?? "Không tìm thấy lượt thi."}</div>;

  const exam = attempt.exam;
  const question = exam.questions[currentIndex];
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;

  function selectAnswer(value: string | string[]) {
    const selected = typeof value === "string" ? value : value[0] ?? "";
    setAnswers((current) => {
      const next = { ...current };
      if (selected) next[question.id] = selected;
      else delete next[question.id];
      return next;
    });
    saveAnswer(question.id, selected || null);
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <ExamHeader examTitle={exam.title} gradeLabel={exam.gradeLabel} totalQuestions={exam.totalQuestions} answeredCount={answeredCount} durationMinutes={exam.durationMinutes} deadlineAt={attempt.deadlineAt} lastSavedAt={lastSavedAt} onTimeUp={() => void submit("timeout")} onOpenSubmitModal={() => setIsSubmitOpen(true)} onToggleScratchpad={() => setIsScratchpadOpen((value) => !value)} isScratchpadOpen={isScratchpadOpen} />
      {error && <div className="mx-auto mt-4 w-full max-w-7xl px-4"><p className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p></div>}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-4 sm:p-6 lg:p-8">
        <div className="grid flex-1 gap-6 lg:grid-cols-12">
          <div className={`flex flex-col ${isScratchpadOpen && isScratchpadDocked ? "lg:col-span-6" : "lg:col-span-8"}`}>
            <QuestionCard question={question} totalQuestions={exam.questions.length} selectedAnswer={answers[question.id]} isFlagged={!!flagged[question.id]} onSelectAnswer={selectAnswer} onToggleFlag={() => setFlagged((current) => ({ ...current, [question.id]: !current[question.id] }))} onNext={() => setCurrentIndex((value) => Math.min(exam.questions.length - 1, value + 1))} onPrevious={() => setCurrentIndex((value) => Math.max(0, value - 1))} canNext={currentIndex < exam.questions.length - 1} canPrevious={currentIndex > 0} />
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm lg:hidden">
              <button onClick={() => setIsMobileNavOpen(true)} className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"><LayoutGrid className="h-4 w-4 text-blue-600" /> Câu hỏi ({answeredCount}/{exam.totalQuestions})</button>
              <button onClick={() => setIsScratchpadOpen(true)} className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"><Pencil className="h-4 w-4" /> Bảng nháp</button>
            </div>
          </div>
          {isScratchpadOpen && isScratchpadDocked ? (
            <div className="hidden lg:col-span-6 lg:flex lg:h-[720px]"><Scratchpad isOpen onClose={() => setIsScratchpadOpen(false)} isDocked onToggleDock={() => setIsScratchpadDocked(false)} /></div>
          ) : (
            <div className="hidden lg:col-span-4 lg:block"><QuestionNavigator questions={exam.questions} currentIndex={currentIndex} answers={answers} flaggedQuestions={flagged} onSelectQuestion={setCurrentIndex} /></div>
          )}
        </div>
      </main>
      {isScratchpadOpen && !isScratchpadDocked && <Scratchpad isOpen onClose={() => setIsScratchpadOpen(false)} isDocked={false} onToggleDock={() => setIsScratchpadDocked(true)} />}
      {isMobileNavOpen && <div className="fixed inset-0 z-50 flex items-end bg-slate-950/50 p-3 lg:hidden"><div className="w-full rounded-3xl bg-white p-4"><button onClick={() => setIsMobileNavOpen(false)} className="mb-3 rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold">Đóng</button><QuestionNavigator questions={exam.questions} currentIndex={currentIndex} answers={answers} flaggedQuestions={flagged} onSelectQuestion={(index) => { setCurrentIndex(index); setIsMobileNavOpen(false); }} /></div></div>}
      <SubmitModal isOpen={isSubmitOpen} totalQuestions={exam.questions.length} answeredCount={answeredCount} flaggedCount={flaggedCount} onClose={() => setIsSubmitOpen(false)} onConfirmSubmit={() => void submit("manual")} isSubmitting={isSubmitting} />
    </div>
  );
}
