"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Play,
  Home,
  X,
  Target,
  Clock,
} from "lucide-react";

interface PracticeSummaryModalProps {
  isOpen: boolean;
  examId: string;
  examTitle: string;
  totalQuestions: number;
  solvedCount: number;
  firstTryCount: number;
  retryCount: number;
  timeSpentSeconds: number;
  onRestart: () => void;
  onClose: () => void;
}

export function PracticeSummaryModal({
  isOpen,
  examId,
  examTitle,
  totalQuestions,
  solvedCount,
  firstTryCount,
  retryCount,
  timeSpentSeconds,
  onRestart,
  onClose,
}: PracticeSummaryModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const minutes = Math.floor(timeSpentSeconds / 60);
  const seconds = timeSpentSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const completionPercent = totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0;
  const firstTryPercent = totalQuestions > 0 ? Math.round((firstTryCount / totalQuestions) * 100) : 0;

  let badgeTitle = "🌟 Khởi đầu tuyệt vời!";
  let badgeSubtitle = "Em hãy tiếp tục chăm chỉ luyện tập để phản xạ nhanh hơn nữa nhé.";

  if (firstTryPercent >= 80) {
    badgeTitle = "🏆 Siêu sao Olympic!";
    badgeSubtitle = "Khả năng tư duy toán học của em cực kỳ xuất sắc và chính xác!";
  } else if (firstTryPercent >= 50 || completionPercent === 100) {
    badgeTitle = "🎯 Kiên trì đáng khen!";
    badgeSubtitle = "Em đã hoàn thành rất tốt và học được nhiều bài học từ các lần thử lại.";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-2xl animate-in zoom-in-95">
        {/* Header Ribbon */}
        <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-center text-white">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20 transition"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-amber-300 shadow-inner">
            <Trophy className="h-8 w-8" />
          </div>

          <h2 className="mt-3 font-heading text-2xl font-black">{badgeTitle}</h2>
          <p className="mt-1 text-xs text-blue-100">{badgeSubtitle}</p>
        </div>

        {/* Modal Body Stats */}
        <div className="p-6 sm:p-7">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-500">
            Kết quả luyện tập • {examTitle}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3.5">
              <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" />
              <strong className="mt-1 block font-heading text-xl font-extrabold text-emerald-900">
                {firstTryCount}/{totalQuestions}
              </strong>
              <span className="text-[11px] font-semibold text-emerald-700">Đúng lần đầu</span>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3.5">
              <Sparkles className="mx-auto h-5 w-5 text-amber-600" />
              <strong className="mt-1 block font-heading text-xl font-extrabold text-amber-900">
                {retryCount}
              </strong>
              <span className="text-[11px] font-semibold text-amber-700">Đúng khi thử lại</span>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5">
              <Clock className="mx-auto h-5 w-5 text-blue-600" />
              <strong className="mt-1 block font-heading text-xl font-extrabold text-blue-900">
                {timeFormatted}
              </strong>
              <span className="text-[11px] font-semibold text-blue-700">Thời gian làm</span>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600 border border-slate-100">
            <p className="flex items-center gap-1.5 font-bold text-slate-800">
              <Target className="h-4 w-4 text-indigo-600" />
              Ghi chú chế độ luyện tập:
            </p>
            <p className="mt-1">
              Bài làm trong chế độ này không lưu vào bảng thành tích thi chính thức. Em đã nắm vững kiến thức có thể chuyển sang chế độ <strong>Thi thử</strong> để chấm điểm xếp hạng!
            </p>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 space-y-2.5">
            <button
              onClick={() => {
                onClose();
                router.push(`/student/exams/${examId}`);
              }}
              className="tactile-btn tactile-btn-amber flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 py-3 text-sm font-black text-slate-950 hover:bg-amber-300 transition"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Chuyển sang Thi thử tính điểm</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onRestart();
                  onClose();
                }}
                className="tactile-btn flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Luyện tập lại</span>
              </button>

              <button
                onClick={() => router.push("/student/exams")}
                className="tactile-btn flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Danh sách đề</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
