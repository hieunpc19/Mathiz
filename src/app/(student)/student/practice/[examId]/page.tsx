"use client";

import { use, useCallback, useEffect, useState } from "react";
import { LayoutGrid, LoaderCircle, Pencil } from "lucide-react";
import type { AttemptExam } from "@/lib/exams/types";
import { PracticeHeader } from "@/components/quiz/practice-header";
import {
  PracticeQuestionCard,
  type QuestionPracticeState,
} from "@/components/quiz/practice-question-card";
import { PracticeNavigator } from "@/components/quiz/practice-navigator";
import { PracticeSummaryModal } from "@/components/quiz/practice-summary-modal";
import { Scratchpad } from "@/components/quiz/scratchpad";

export default function StudentPracticePage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = use(params);

  const [exam, setExam] = useState<AttemptExam | null>(null);
  const [practiceStates, setPracticeStates] = useState<Record<string, QuestionPracticeState>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isScratchpadDocked, setIsScratchpadDocked] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const [isChecking, setIsChecking] = useState(false);
  const [checkingOptionId, setCheckingOptionId] = useState<string | null>(null);
  const [startTime] = useState<number>(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Track elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Load practice exam
  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch(`/api/exams/${examId}/practice`, { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error?.message ?? "Không thể tải đề luyện tập.");
        }
        setExam(payload.data.exam);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không thể tải đề luyện tập.");
      } finally {
        setLoading(false);
      }
    })();
  }, [examId]);

  const currentQuestion = exam?.questions[currentIndex];

  const handleSelectOption = useCallback(
    async (optionId: string) => {
      if (!currentQuestion || isChecking) return;
      const questionId = currentQuestion.id;
      const current = practiceStates[questionId];
      if (current?.isSolved || current?.wrongOptionIds?.includes(optionId)) return;

      setIsChecking(true);
      setCheckingOptionId(optionId);

      try {
        const response = await fetch(`/api/exams/${examId}/practice/check`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId, selectedKey: optionId }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Kiểm tra đáp án thất bại.");

        const isCorrect = Boolean(payload.data?.isCorrect);

        setPracticeStates((prev) => {
          const prevState = prev[questionId] ?? {
            isSolved: false,
            wrongOptionIds: [],
            firstTrySuccess: false,
            attemptsCount: 0,
          };

          if (isCorrect) {
            const isFirstTry = (prevState.wrongOptionIds?.length ?? 0) === 0;
            return {
              ...prev,
              [questionId]: {
                isSolved: true,
                correctOptionId: optionId,
                wrongOptionIds: prevState.wrongOptionIds ?? [],
                firstTrySuccess: isFirstTry,
                attemptsCount: (prevState.attemptsCount ?? 0) + 1,
              },
            };
          } else {
            const nextWrongs = [...(prevState.wrongOptionIds ?? []), optionId];
            return {
              ...prev,
              [questionId]: {
                isSolved: false,
                wrongOptionIds: nextWrongs,
                firstTrySuccess: false,
                attemptsCount: (prevState.attemptsCount ?? 0) + 1,
              },
            };
          }
        });
      } catch (cause) {
        console.error(cause);
      } finally {
        setIsChecking(false);
        setCheckingOptionId(null);
      }
    },
    [currentQuestion, examId, isChecking, practiceStates],
  );

  const handleResetQuestion = useCallback(() => {
    if (!currentQuestion) return;
    setPracticeStates((prev) => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
  }, [currentQuestion]);

  const handleRestartPractice = useCallback(() => {
    setPracticeStates({});
    setCurrentIndex(0);
    setFlagged({});
    setIsSummaryOpen(false);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-slate-100 text-slate-600 font-medium">
        <LoaderCircle className="h-6 w-6 animate-spin text-blue-600" />
        Đang tải đề luyện tập tức thì...
      </div>
    );
  }

  if (!exam || !currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-100 p-10 text-center text-rose-700 font-bold">
        {error ?? "Không tìm thấy nội dung đề luyện tập."}
      </div>
    );
  }

  const solvedCount = Object.values(practiceStates).filter((s) => s.isSolved).length;
  const firstTryCount = Object.values(practiceStates).filter((s) => s.isSolved && s.firstTrySuccess).length;
  const retryCount = Object.values(practiceStates).filter((s) => s.isSolved && !s.firstTrySuccess).length;

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      {/* Header */}
      <PracticeHeader
        examTitle={exam.title}
        gradeLabel={exam.gradeLabel}
        totalQuestions={exam.questions.length}
        solvedCount={solvedCount}
        durationMinutes={exam.durationMinutes}
        onTimeUp={() => setIsSummaryOpen(true)}
        onFinishPractice={() => setIsSummaryOpen(true)}
        onToggleScratchpad={() => setIsScratchpadOpen((v) => !v)}
        isScratchpadOpen={isScratchpadOpen}
      />

      {/* Main Content Arena */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-4 sm:p-6 lg:p-8">
        <div className="grid flex-1 gap-6 lg:grid-cols-12">
          {/* Question Column */}
          <div
            className={`flex flex-col ${
              isScratchpadOpen && isScratchpadDocked ? "lg:col-span-6" : "lg:col-span-8"
            }`}
          >
            <PracticeQuestionCard
              question={currentQuestion}
              totalQuestions={exam.questions.length}
              practiceState={practiceStates[currentQuestion.id]}
              isChecking={isChecking}
              checkingOptionId={checkingOptionId}
              onSelectOption={handleSelectOption}
              onResetQuestion={handleResetQuestion}
              onNext={() => setCurrentIndex((val) => Math.min(exam.questions.length - 1, val + 1))}
              onPrevious={() => setCurrentIndex((val) => Math.max(0, val - 1))}
              canNext={currentIndex < exam.questions.length - 1}
              canPrevious={currentIndex > 0}
              isFlagged={!!flagged[currentQuestion.id]}
              onToggleFlag={() =>
                setFlagged((prev) => ({
                  ...prev,
                  [currentQuestion.id]: !prev[currentQuestion.id],
                }))
              }
            />

            {/* Mobile Bottom Bar for Tools */}
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm lg:hidden">
              <button
                onClick={() => setIsMobileNavOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
              >
                <LayoutGrid className="h-4 w-4 text-blue-600" />
                Câu hỏi ({solvedCount}/{exam.questions.length})
              </button>
              <button
                onClick={() => setIsScratchpadOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
              >
                <Pencil className="h-4 w-4" />
                Bảng nháp
              </button>
            </div>
          </div>

          {/* Sidebar Navigation Column */}
          {isScratchpadOpen && isScratchpadDocked ? (
            <div className="hidden lg:col-span-6 lg:flex lg:h-[720px]">
              <Scratchpad
                isOpen
                onClose={() => setIsScratchpadOpen(false)}
                isDocked
                onToggleDock={() => setIsScratchpadDocked(false)}
              />
            </div>
          ) : (
            <div className="hidden lg:col-span-4 lg:block">
              <PracticeNavigator
                questions={exam.questions}
                currentIndex={currentIndex}
                practiceStates={practiceStates}
                flaggedQuestions={flagged}
                onSelectQuestion={setCurrentIndex}
              />
            </div>
          )}
        </div>
      </main>

      {/* Floating Scratchpad (when not docked) */}
      {isScratchpadOpen && !isScratchpadDocked && (
        <Scratchpad
          isOpen
          onClose={() => setIsScratchpadOpen(false)}
          isDocked={false}
          onToggleDock={() => setIsScratchpadDocked(true)}
        />
      )}

      {/* Mobile Drawer Navigation */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/50 p-3 lg:hidden">
          <div className="w-full rounded-3xl bg-white p-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <span className="font-heading font-bold text-slate-900">Danh sách câu hỏi</span>
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
              >
                Đóng
              </button>
            </div>
            <PracticeNavigator
              questions={exam.questions}
              currentIndex={currentIndex}
              practiceStates={practiceStates}
              flaggedQuestions={flagged}
              onSelectQuestion={(idx) => {
                setCurrentIndex(idx);
                setIsMobileNavOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Summary Modal */}
      <PracticeSummaryModal
        isOpen={isSummaryOpen}
        examId={exam.id}
        examTitle={exam.title}
        totalQuestions={exam.questions.length}
        solvedCount={solvedCount}
        firstTryCount={firstTryCount}
        retryCount={retryCount}
        timeSpentSeconds={elapsedSeconds}
        onRestart={handleRestartPractice}
        onClose={() => setIsSummaryOpen(false)}
      />
    </div>
  );
}
