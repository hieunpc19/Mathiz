"use client";

import React, { useState } from "react";
import { Bookmark } from "lucide-react";
import type { ExamQuestion } from "@/lib/exams/types";

interface QuestionNavigatorProps {
  questions: ExamQuestion[];
  currentIndex: number;
  answers: Record<string, string | string[]>;
  flaggedQuestions: Record<string, boolean>;
  onSelectQuestion: (index: number) => void;
  className?: string;
}

type FilterTab = "all" | "answered" | "unanswered" | "flagged";

export function QuestionNavigator({
  questions,
  currentIndex,
  answers,
  flaggedQuestions,
  onSelectQuestion,
  className = "",
}: QuestionNavigatorProps) {
  const [filter, setFilter] = useState<FilterTab>("all");

  const isAnswered = (qId: string) => {
    const ans = answers[qId];
    if (ans === undefined || ans === "") return false;
    if (Array.isArray(ans) && ans.length === 0) return false;
    return true;
  };

  const isFlagged = (qId: string) => !!flaggedQuestions[qId];

  const answeredCount = questions.filter((q) => isAnswered(q.id)).length;
  const flaggedCount = questions.filter((q) => isFlagged(q.id)).length;
  const unansweredCount = questions.length - answeredCount;

  const filteredQuestions = questions.map((q, idx) => ({ q, idx })).filter(({ q }) => {
    if (filter === "answered") return isAnswered(q.id);
    if (filter === "unanswered") return !isAnswered(q.id);
    if (filter === "flagged") return isFlagged(q.id);
    return true;
  });

  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {/* Title & Progress Summary */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-heading text-lg font-bold text-slate-900">
            Danh sách câu hỏi
          </h3>
          <p className="text-xs text-slate-500">
            Đã làm <span className="font-bold text-emerald-600">{answeredCount}</span>/
            {questions.length} câu
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold">
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {Math.round((answeredCount / questions.length) * 100)}%
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
          onClick={() => setFilter("answered")}
          className={`rounded-lg py-1.5 transition-colors ${
            filter === "answered"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Đã làm ({answeredCount})
        </button>
        <button
          onClick={() => setFilter("flagged")}
          className={`rounded-lg py-1.5 transition-colors ${
            filter === "flagged"
              ? "bg-white text-amber-700 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Cờ ({flaggedCount})
        </button>
        <button
          onClick={() => setFilter("unanswered")}
          className={`rounded-lg py-1.5 transition-colors ${
            filter === "unanswered"
              ? "bg-white text-rose-700 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Chưa ({unansweredCount})
        </button>
      </div>

      {/* Question Grid Tiles */}
      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-5 md:grid-cols-5">
        {filteredQuestions.map(({ q, idx }) => {
          const active = currentIndex === idx;
          const answered = isAnswered(q.id);
          const flagged = isFlagged(q.id);

          return (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(idx)}
              className={`relative flex h-12 w-full flex-col items-center justify-center rounded-2xl text-sm font-bold transition-all ${
                active
                  ? "border-2 border-blue-600 bg-blue-50 text-blue-800 shadow-md ring-2 ring-blue-400/40 scale-105"
                  : answered
                  ? "border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>{q.position}</span>

              {/* Status Badge Pin */}
              {flagged && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm ring-1 ring-white">
                  <Bookmark className="h-2.5 w-2.5 fill-current" />
                </span>
              )}
              {answered && !flagged && (
                <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
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
          <span>Đã chọn đáp án</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-amber-500 text-white">
            <Bookmark className="h-2 w-2 fill-current" />
          </span>
          <span>Đánh dấu xem lại</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-slate-300 bg-white" />
          <span>Chưa trả lời</span>
        </div>
      </div>
    </div>
  );
}
