"use client";

import React, { useEffect } from "react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Keyboard,
  CheckCircle2,
} from "lucide-react";
import type { ExamQuestion } from "@/lib/exams/types";
import { MathRenderer } from "@/components/math/math-renderer";
import { VirtualNumpad } from "@/components/quiz/virtual-numpad";

interface QuestionCardProps {
  question: ExamQuestion;
  totalQuestions: number;
  selectedAnswer?: string | string[];
  isFlagged?: boolean;
  onSelectAnswer: (answer: string | string[]) => void;
  onToggleFlag: () => void;
  onNext: () => void;
  onPrevious: () => void;
  canNext: boolean;
  canPrevious: boolean;
  isNumpadOpen?: boolean;
  onToggleNumpad?: () => void;
}

export function QuestionCard({
  question,
  totalQuestions,
  selectedAnswer,
  isFlagged = false,
  onSelectAnswer,
  onToggleFlag,
  onNext,
  onPrevious,
  canNext,
  canPrevious,
  isNumpadOpen = false,
  onToggleNumpad,
}: QuestionCardProps) {
  const fillValue = typeof selectedAnswer === "string" ? selectedAnswer : "";

  const handleFillChange = (val: string) => {
    onSelectAnswer(val);
  };

  const handleClearAnswer = () => {
    onSelectAnswer("");
  };

  // Keyboard shortcut listeners (1-4 for single choices)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (question.type === "single_choice" && question.options) {
        if (e.key === "1" || e.key === "a" || e.key === "A") {
          onSelectAnswer("A");
        } else if (e.key === "2" || e.key === "b" || e.key === "B") {
          onSelectAnswer("B");
        } else if (e.key === "3" || e.key === "c" || e.key === "C") {
          onSelectAnswer("C");
        } else if (e.key === "4" || e.key === "d" || e.key === "D") {
          onSelectAnswer("D");
        }
      }

      if (e.key === "f" || e.key === "F") {
        onToggleFlag();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [question, onSelectAnswer, onToggleFlag]);

  return (
    <div className="flex flex-col rounded-3xl border-2 border-slate-200/80 bg-white p-5 shadow-md sm:p-8">
      {/* Top Bar: Question index, Category, Points, Flag Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 font-heading text-lg font-bold text-white shadow-sm">
            {question.position}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {question.category}
              </span>
              <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                +{question.points} điểm
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Câu {question.position} trên tổng số {totalQuestions} câu
            </p>
          </div>
        </div>

        {/* Flag Bookmark Toggle */}
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
          <span>{isFlagged ? "Đã đánh dấu cờ" : "Đánh dấu xem lại (F)"}</span>
        </button>
      </div>

      {/* Question Content Body */}
      <div className="my-6">
        <MathRenderer
          content={question.bodyMd}
          className="text-lg font-medium text-slate-800 leading-relaxed sm:text-xl"
        />

      </div>

      {/* Answer Formats */}
      <div className="mt-2 space-y-4">
        {/* Single Choice Options */}
        {question.type === "single_choice" && question.options && (
          <div className="grid gap-3 sm:grid-cols-2">
            {question.options.map((opt, idx) => {
              const isSelected = selectedAnswer === opt.id;
              const shortcutNumber = idx + 1;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSelectAnswer(opt.id)}
                  className={`group relative flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/30"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/60"
                  }`}
                >
                  {/* Option Badge A, B, C, D */}
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-heading text-lg font-bold transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700"
                    }`}
                  >
                    {opt.label}
                  </span>

                  {/* Option Text / Math */}
                  <div className="flex-1">
                    <MathRenderer
                      content={opt.text}
                      className="text-base font-semibold text-slate-800"
                    />
                  </div>

                  {/* Selection Indicator & Keyboard Shortcut */}
                  <div className="flex items-center gap-1.5">
                    <span className="hidden rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-400 sm:inline">
                      [{shortcutNumber}]
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Fill in the blank format */}
        {question.type === "fill_blank" && (
          <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-6">
            <label className="block text-sm font-bold text-slate-800">
              Nhập đáp án số của em:
            </label>
            <p className="mt-1 text-xs text-slate-500">
              Em có thể gõ bàn phím máy tính hoặc bấm mở Bàn phím số cảm ứng để nhập trên iPad.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={fillValue}
                  placeholder="Nhập số..."
                  onClick={onToggleNumpad}
                  className="h-14 w-48 rounded-2xl border-2 border-blue-400 bg-white px-4 text-center font-heading text-2xl font-bold tracking-wider text-blue-900 shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-200 cursor-pointer"
                />
                {fillValue && (
                  <button
                    onClick={handleClearAnswer}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-400 text-white hover:bg-slate-600 shadow-sm"
                  >
                    ×
                  </button>
                )}
              </div>

              {onToggleNumpad && (
                <button
                  type="button"
                  onClick={onToggleNumpad}
                  className={`tactile-btn flex items-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-bold transition-colors ${
                    isNumpadOpen
                      ? "border border-blue-300 bg-blue-600 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Keyboard className="h-4 w-4" />
                  <span>{isNumpadOpen ? "Ẩn bàn phím số" : "Mở bàn phím số cảm ứng"}</span>
                </button>
              )}
            </div>

            {/* Inline Numpad for iPad touch */}
            {isNumpadOpen && (
              <div className="mt-4 max-w-sm">
                <VirtualNumpad
                  value={fillValue}
                  onChange={handleFillChange}
                  onSubmit={() => {
                    if (canNext) onNext();
                  }}
                  onClose={onToggleNumpad}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation Bar */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
        <div>
          {selectedAnswer && (
            <button
              onClick={handleClearAnswer}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Xóa câu trả lời này</span>
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
            className="tactile-btn flex items-center gap-1 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-40"
          >
            <span>Câu tiếp theo</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
