"use client";

import React, { useEffect, useState } from "react";
import { Clock, Pencil, Sparkles, Trophy } from "lucide-react";

interface PracticeHeaderProps {
  examTitle: string;
  gradeLabel: string;
  totalQuestions: number;
  solvedCount: number;
  durationMinutes: number;
  onTimeUp: () => void;
  onFinishPractice: () => void;
  onToggleScratchpad: () => void;
  isScratchpadOpen: boolean;
}

export function PracticeHeader({
  examTitle,
  gradeLabel,
  totalQuestions,
  solvedCount,
  durationMinutes,
  onTimeUp,
  onFinishPractice,
  onToggleScratchpad,
  isScratchpadOpen,
}: PracticeHeaderProps) {
  const initialSeconds = durationMinutes > 0 ? durationMinutes * 60 : 30 * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeUp]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder
      .toString()
      .padStart(2, "0")}`;
  };

  const isLowTime = secondsRemaining <= 300; // < 5 mins
  const isCriticalTime = secondsRemaining <= 60; // < 1 min
  const progressPercent = totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Left: Exam Info & Practice Progress */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Luyện tập • {gradeLabel}
              </span>
              <h1 className="truncate font-heading text-sm font-bold text-slate-900 sm:text-base md:max-w-md">
                {examTitle}
              </h1>
            </div>

            {/* Progress bar info */}
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span>
                Đã giải đúng: <strong className="text-emerald-700">{solvedCount}/{totalQuestions}</strong> câu
              </span>
              <div className="h-2 w-20 sm:w-28 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-emerald-600">
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Right: Countdown Timer, Scratchpad, Finish */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Countdown Timer */}
          <div
            className={`flex items-center gap-2 rounded-2xl px-3.5 py-1.5 font-mono text-sm font-bold transition-colors ${
              isCriticalTime
                ? "bg-rose-600 text-white animate-bounce shadow-md shadow-rose-200"
                : isLowTime
                ? "bg-amber-100 text-amber-900 ring-2 ring-amber-400"
                : "border border-slate-200 bg-slate-100 text-slate-800"
            }`}
          >
            <Clock
              className={`h-4 w-4 ${
                isCriticalTime
                  ? "text-white"
                  : isLowTime
                  ? "text-amber-600"
                  : "text-blue-600"
              }`}
            />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          {/* Scratchpad Button */}
          <button
            onClick={onToggleScratchpad}
            title="Mở bảng nháp tính toán"
            className={`tactile-btn flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold transition-all sm:text-sm ${
              isScratchpadOpen
                ? "border border-blue-400 bg-blue-50 text-blue-700 shadow-sm"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Pencil className="h-4 w-4 text-blue-600" />
            <span className="hidden sm:inline">Bảng nháp</span>
          </button>

          {/* Finish / View Summary Button */}
          <button
            onClick={onFinishPractice}
            className="tactile-btn flex items-center gap-1.5 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 sm:text-sm"
          >
            <Trophy className="h-4 w-4 text-amber-300" />
            <span>Kết thúc</span>
          </button>
        </div>
      </div>
    </header>
  );
}
