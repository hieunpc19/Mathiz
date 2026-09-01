"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Clock, Pencil, Maximize, Minimize, Send } from "lucide-react";

interface ExamHeaderProps {
  examTitle: string;
  gradeLabel: string;
  totalQuestions: number;
  answeredCount: number;
  durationMinutes: number;
  deadlineAt?: string | null;
  lastSavedAt?: Date | null;
  onTimeUp: () => void;
  onOpenSubmitModal: () => void;
  onToggleScratchpad: () => void;
  isScratchpadOpen: boolean;
}

export function ExamHeader({
  examTitle,
  gradeLabel,
  totalQuestions,
  answeredCount,
  durationMinutes,
  deadlineAt,
  lastSavedAt,
  onTimeUp,
  onOpenSubmitModal,
  onToggleScratchpad,
  isScratchpadOpen,
}: ExamHeaderProps) {
  const calculateRemaining = useCallback(() =>
    deadlineAt
      ? Math.max(0, Math.ceil((Date.parse(deadlineAt) - Date.now()) / 1000))
      : durationMinutes * 60, [deadlineAt, durationMinutes]);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(calculateRemaining);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateRemaining();
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateRemaining, onTimeUp]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder
      .toString()
      .padStart(2, "0")}`;
  };

  const isLowTime = secondsRemaining <= 300; // < 5 mins
  const isCriticalTime = secondsRemaining <= 60; // < 1 min

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Left: Exam Info & Progress */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                {gradeLabel}
              </span>
              <h1 className="truncate font-heading text-sm font-bold text-slate-900 sm:text-base md:max-w-md">
                {examTitle}
              </h1>
            </div>
            
            {/* Progress bar info */}
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span>
                Tiến độ: <strong className="text-slate-800">{answeredCount}/{totalQuestions}</strong> câu
              </span>
              <div className="h-2 w-20 sm:w-28 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="hidden text-[11px] font-semibold text-emerald-600 sm:inline">
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right: Timer, Tools, Submit */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Autosave badge */}
          <div className="hidden items-center gap-1 text-[11px] font-medium text-slate-500 md:flex">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {lastSavedAt
                ? `Đã lưu ${lastSavedAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
                : "Đang đồng bộ"}
            </span>
          </div>

          {/* Countdown Timer Badge */}
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

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title="Toàn màn hình"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </button>

          {/* Submit Action Button */}
          <button
            onClick={onOpenSubmitModal}
            className="tactile-btn flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 sm:text-sm"
          >
            <Send className="h-4 w-4" />
            <span>Nộp bài</span>
          </button>
        </div>
      </div>
    </header>
  );
}
