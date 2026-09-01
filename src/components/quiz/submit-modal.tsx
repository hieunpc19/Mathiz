"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, Send, X } from "lucide-react";

interface SubmitModalProps {
  isOpen: boolean;
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
  onClose: () => void;
  onConfirmSubmit: () => void;
  isSubmitting?: boolean;
}

export function SubmitModal({
  isOpen,
  totalQuestions,
  answeredCount,
  flaggedCount,
  onClose,
  onConfirmSubmit,
  isSubmitting = false,
}: SubmitModalProps) {
  if (!isOpen) return null;

  const unansweredCount = totalQuestions - answeredCount;
  const hasUnanswered = unansweredCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                hasUnanswered
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {hasUnanswered ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
            </span>
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Xác nhận nộp bài thi
              </h3>
              <p className="text-xs text-slate-500">
                Kiểm tra lại số lượng câu hỏi trước khi hoàn tất
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="my-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3 text-center">
            <span className="block font-heading text-2xl font-bold text-emerald-700">
              {answeredCount}
            </span>
            <span className="mt-0.5 text-xs font-semibold text-emerald-800">
              Đã hoàn thành
            </span>
          </div>

          <div
            className={`rounded-2xl border p-3 text-center ${
              hasUnanswered
                ? "border-rose-200 bg-rose-50/60 text-rose-700"
                : "border-slate-200 bg-slate-50 text-slate-600"
            }`}
          >
            <span className="block font-heading text-2xl font-bold">
              {unansweredCount}
            </span>
            <span className="mt-0.5 text-xs font-semibold">Chưa làm</span>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3 text-center">
            <span className="block font-heading text-2xl font-bold text-amber-700">
              {flaggedCount}
            </span>
            <span className="mt-0.5 text-xs font-semibold text-amber-800">
              Đang cắm cờ
            </span>
          </div>
        </div>

        {/* Advisory message */}
        {hasUnanswered ? (
          <div className="mb-6 rounded-2xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-200">
            <strong>Lưu ý:</strong> Em vẫn còn{" "}
            <span className="font-bold underline">{unansweredCount} câu</span> chưa trả
            lời. Sau khi nộp bài, em sẽ không thể thay đổi đáp án nữa.
          </div>
        ) : (
          <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-xs leading-relaxed text-emerald-900 ring-1 ring-emerald-200">
            Tuyệt vời! Em đã hoàn thành tất cả các câu hỏi trong đề thi. Hãy bấm <strong>Nộp bài ngay</strong> để xem điểm số và lời giải chi tiết.
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="tactile-btn rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Làm tiếp
          </button>
          <button
            type="button"
            onClick={onConfirmSubmit}
            disabled={isSubmitting}
            className="tactile-btn flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span>{isSubmitting ? "Đang xử lý..." : "Nộp bài ngay"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
