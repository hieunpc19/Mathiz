"use client";

import React, { useEffect } from "react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  LoaderCircle,
  HelpCircle,
} from "lucide-react";
import type { ExamQuestion } from "@/lib/exams/types";
import { MathRenderer } from "@/components/math/math-renderer";

export interface QuestionPracticeState {
  isSolved: boolean;
  correctOptionId?: string;
  wrongOptionIds: string[];
  firstTrySuccess: boolean;
  attemptsCount: number;
}

interface PracticeQuestionCardProps {
  question: ExamQuestion;
  totalQuestions: number;
  practiceState?: QuestionPracticeState;
  isChecking: boolean;
  checkingOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  onResetQuestion: () => void;
  onNext: () => void;
  onPrevious: () => void;
  canNext: boolean;
  canPrevious: boolean;
  isFlagged?: boolean;
  onToggleFlag?: () => void;
}

export function PracticeQuestionCard({
  question,
  totalQuestions,
  practiceState,
  isChecking,
  checkingOptionId,
  onSelectOption,
  onResetQuestion,
  onNext,
  onPrevious,
  canNext,
  canPrevious,
  isFlagged = false,
  onToggleFlag,
}: PracticeQuestionCardProps) {
  const isSolved = !!practiceState?.isSolved;
  const correctOptionId = practiceState?.correctOptionId;
  const wrongOptionIds = practiceState?.wrongOptionIds ?? [];
  const hasWrongAttempts = wrongOptionIds.length > 0;

  // Keyboard shortcut listeners (1-4, A-D for single choices)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (isSolved || isChecking) return;

      if (question.type === "single_choice" && question.options) {
        if (e.key === "1" || e.key === "a" || e.key === "A") {
          const opt = question.options[0];
          if (opt && !wrongOptionIds.includes(opt.id)) onSelectOption(opt.id);
        } else if (e.key === "2" || e.key === "b" || e.key === "B") {
          const opt = question.options[1];
          if (opt && !wrongOptionIds.includes(opt.id)) onSelectOption(opt.id);
        } else if (e.key === "3" || e.key === "c" || e.key === "C") {
          const opt = question.options[2];
          if (opt && !wrongOptionIds.includes(opt.id)) onSelectOption(opt.id);
        } else if (e.key === "4" || e.key === "d" || e.key === "D") {
          const opt = question.options[3];
          if (opt && !wrongOptionIds.includes(opt.id)) onSelectOption(opt.id);
        }
      }

      if (e.key === "Enter" && isSolved && canNext) {
        onNext();
      }

      if ((e.key === "f" || e.key === "F") && onToggleFlag) {
        onToggleFlag();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [question, isSolved, isChecking, wrongOptionIds, onSelectOption, canNext, onNext, onToggleFlag]);

  return (
    <div className="flex flex-col rounded-3xl border-2 border-slate-200/80 bg-white p-5 shadow-md sm:p-8">
      {/* Top Bar: Question index, Category, Points, Mode badge, Flag Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-2xl font-heading text-lg font-bold text-white shadow-sm transition-colors ${
              isSolved
                ? "bg-emerald-600 ring-4 ring-emerald-100"
                : hasWrongAttempts
                ? "bg-amber-600 ring-4 ring-amber-100"
                : "bg-blue-600 shadow-sm"
            }`}
          >
            {question.position}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {question.category}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                <Sparkles className="h-3 w-3" />
                Luyện tập tức thì
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Câu {question.position} trên tổng số {totalQuestions} câu
            </p>
          </div>
        </div>

        {/* Flag Bookmark Toggle */}
        {onToggleFlag && (
          <button
            onClick={onToggleFlag}
            className={`tactile-btn flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-semibold transition-all ${
              isFlagged
                ? "border border-amber-300 bg-amber-50 text-amber-800 shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Bookmark
              className={`h-4 w-4 ${
                isFlagged ? "fill-amber-500 text-amber-500" : "text-slate-400"
              }`}
            />
            <span>{isFlagged ? "Đã đánh dấu" : "Đánh dấu xem lại (F)"}</span>
          </button>
        )}
      </div>

      {/* Question Content Body */}
      <div className="my-6">
        <MathRenderer
          content={question.bodyMd}
          className="text-lg font-medium text-slate-800 leading-relaxed sm:text-xl"
        />
      </div>

      {/* Answer Formats (Single Choice Options with instant feedback) */}
      <div className="mt-2 space-y-4">
        {question.type === "single_choice" && question.options && (
          <div className="grid gap-3 sm:grid-cols-2">
            {question.options.map((opt, idx) => {
              const isOptionChecking = isChecking && checkingOptionId === opt.id;
              const isOptionCorrect = isSolved && correctOptionId === opt.id;
              const isOptionWrong = wrongOptionIds.includes(opt.id);
              const shortcutNumber = idx + 1;

              let cardStyle = "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/60";
              let badgeStyle = "bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700";

              if (isOptionCorrect) {
                cardStyle = "border-emerald-500 bg-emerald-50/90 shadow-md ring-2 ring-emerald-400/50";
                badgeStyle = "bg-emerald-600 text-white shadow-sm";
              } else if (isOptionWrong) {
                cardStyle = "border-rose-400 bg-rose-50/90 text-rose-950 opacity-90";
                badgeStyle = "bg-rose-600 text-white shadow-sm";
              } else if (isSolved) {
                cardStyle = "border-slate-200 bg-slate-50/50 opacity-50 cursor-not-allowed";
                badgeStyle = "bg-slate-200 text-slate-400";
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isSolved || isOptionWrong || isChecking}
                  onClick={() => onSelectOption(opt.id)}
                  className={`group relative flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${cardStyle} ${
                    !isSolved && !isOptionWrong && !isChecking ? "active:scale-[0.99] cursor-pointer" : ""
                  }`}
                >
                  {/* Option Badge A, B, C, D */}
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-heading text-lg font-bold transition-colors ${badgeStyle}`}
                  >
                    {isOptionChecking ? (
                      <LoaderCircle className="h-5 w-5 animate-spin text-blue-600" />
                    ) : isOptionCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    ) : isOptionWrong ? (
                      <XCircle className="h-6 w-6 text-white" />
                    ) : (
                      opt.label
                    )}
                  </span>

                  {/* Option Text / Math */}
                  <div className="flex-1">
                    <MathRenderer
                      content={opt.text}
                      className={`text-base font-semibold ${
                        isOptionWrong ? "text-rose-900 line-through opacity-80" : "text-slate-800"
                      }`}
                    />
                  </div>

                  {/* Feedback Status & Shortcut Badge */}
                  <div className="flex items-center gap-1.5">
                    {!isSolved && !isOptionWrong && (
                      <span className="hidden rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-400 sm:inline">
                        [{shortcutNumber}]
                      </span>
                    )}

                    {isOptionCorrect && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Đúng
                      </span>
                    )}

                    {isOptionWrong && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-800">
                        <XCircle className="h-3.5 w-3.5 text-rose-600" />
                        Sai
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Non-single-choice notice if any */}
        {question.type !== "single_choice" && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
            <HelpCircle className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 font-medium">
              Chế độ kiểm tra Đúng/Sai tức thì áp dụng cho các câu hỏi trắc nghiệm chọn phương án.
            </p>
          </div>
        )}
      </div>

      {/* Instant Feedback Banner */}
      <div className="mt-5">
        {isSolved && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 text-emerald-900 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <strong className="block text-sm font-extrabold sm:text-base">
                  🎉 Chính xác! Tuyệt vời lắm em!
                </strong>
                <p className="text-xs text-emerald-800 sm:text-sm">
                  {practiceState?.firstTrySuccess
                    ? "Em đã trả lời đúng ngay từ lần chọn đầu tiên (+1 điểm tối đa)!"
                    : `Em đã tìm ra đáp án đúng sau ${practiceState?.attemptsCount ?? 1} lần thử!`}
                </p>
              </div>
            </div>

            {canNext && (
              <button
                onClick={onNext}
                className="tactile-btn tactile-btn-emerald flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white hover:bg-emerald-700 sm:text-sm"
              >
                <span>Câu tiếp theo</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {!isSolved && hasWrongAttempts && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-rose-900 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <strong className="block text-sm font-extrabold sm:text-base">
                Chưa chính xác, em hãy thử lại nhé!
              </strong>
              <p className="text-xs text-rose-700 sm:text-sm">
                Phương án em vừa chọn chưa đúng. Hãy đọc lại đề bài và bấm chọn phương án khác.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Bar */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
        <div>
          {hasWrongAttempts && !isSolved && (
            <button
              onClick={onResetQuestion}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Thử lại câu này từ đầu</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onPrevious}
            disabled={!canPrevious}
            className="tactile-btn flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Câu trước</span>
          </button>

          <button
            onClick={onNext}
            disabled={!canNext}
            className={`tactile-btn flex items-center gap-1 rounded-2xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-colors disabled:opacity-40 ${
              isSolved
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
            }`}
          >
            <span>Câu tiếp theo</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
