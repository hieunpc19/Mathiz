"use client";

import React, { useState } from "react";
import { Bookmark, CheckCircle2, AlertCircle } from "lucide-react";
import type { ExamQuestion } from "@/lib/exams/types";
import type { QuestionPracticeState } from "@/components/quiz/practice-question-card";

interface PracticeNavigatorProps {
  questions: ExamQuestion[];
  currentIndex: number;
  practiceStates: Record<string, QuestionPracticeState>;
  flaggedQuestions: Record<string, boolean>;
  onSelectQuestion: (index: number) => void;
  className?: string;
}

type FilterTab = "all" | "solved" | "retrying" | "unsolved";

export function PracticeNavigator({
  questions,
  currentIndex,
  practiceStates,
  flaggedQuestions,
  onSelectQuestion,
  className = "",
}: PracticeNavigatorProps) {
  const [filter, setFilter] = useState<FilterTab>("all");

  const isSolved = (qId: string) => !!practiceStates[qId]?.isSolved;
  const isRetrying = (qId: string) => {
    const s = practiceStates[qId];
    return !s?.isSolved && (s?.wrongOptionIds?.length ?? 0) > 0;
  };
  const isFlagged = (qId: string) => !!flaggedQuestions[qId];

  const solvedCount = questions.filter((q) => isSolved(q.id)).length;
  const retryingCount = questions.filter((q) => isRetrying(q.id)).length;
  const unsolvedCount = questions.length - solvedCount;

  const filteredQuestions = questions.map((q, idx) => ({ q, idx })).filter(({ q }) => {
    if (filter === "solved") return isSolved(q.id);
    if (filter === "retrying") return isRetrying(q.id);
    if (filter === "unsolved") return !isSolved(q.id);
    return true;
  });

  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {/* Title & Progress Summary */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-heading text-lg font-bold text-slate-900">
            Tiến độ luyện tập
          </h3>
          <p className="text-xs text-slate-500">
            Đã đúng <span className="font-bold text-emerald-600">{solvedCount}</span>/
            {questions.length} câu
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold">
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 font-heading font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {Math.round((solvedCount / questions.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-3 grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1 text-[11px] font-semibold">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-lg py-1.5 transition-colors ${
            filter === "all"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Tất cả ({questions.length})
        </button>
        <button
          onClick={() => setFilter("solved")}
          className={`rounded-lg py-1.5 transition-colors ${
            filter === "solved"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Đã đúng ({solvedCount})
        </button>
        <button
          onClick={() => setFilter("retrying")}
          className={`rounded-lg py-1.5 transition-colors ${
            filter === "retrying"
              ? "bg-white text-amber-700 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Thử lại ({retryingCount})
        </button>
        <button
          onClick={() => setFilter("unsolved")}
          className={`rounded-lg py-1.5 transition-colors ${
            filter === "unsolved"
              ? "bg-white text-slate-700 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Chưa ({unsolvedCount})
        </button>
      </div>

      {/* Question Grid Tiles */}
      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-5 md:grid-cols-5">
        {filteredQuestions.map(({ q, idx }) => {
          const active = currentIndex === idx;
          const solved = isSolved(q.id);
          const retrying = isRetrying(q.id);
          const flagged = isFlagged(q.id);

          let tileStyle = "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50";

          if (active) {
            tileStyle = "border-2 border-blue-600 bg-blue-50 text-blue-800 shadow-md ring-2 ring-blue-400/40 scale-105";
          } else if (solved) {
            tileStyle = "border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100";
          } else if (retrying) {
            tileStyle = "border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100";
          }

          return (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(idx)}
              className={`relative flex h-12 w-full flex-col items-center justify-center rounded-2xl text-sm font-bold transition-all ${tileStyle}`}
            >
              <span>{q.position}</span>

              {/* Status Badge Pin */}
              {flagged && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm ring-1 ring-white">
                  <Bookmark className="h-2.5 w-2.5 fill-current" />
                </span>
              )}
              {solved && !flagged && (
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                  <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                </span>
              )}
              {retrying && !solved && !flagged && (
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-amber-500 ring-2 ring-white">
                  <AlertCircle className="h-2.5 w-2.5 text-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border-2 border-blue-600 bg-blue-100" />
          <span>Đang làm</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          <span>Đã trả lời đúng</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-amber-500" />
          <span>Đang thử lại</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-slate-300 bg-white" />
          <span>Chưa trả lời</span>
        </div>
      </div>
    </div>
  );
}
