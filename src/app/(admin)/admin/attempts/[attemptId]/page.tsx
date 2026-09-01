"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  XCircle,
} from "lucide-react";
import { MathRenderer } from "@/components/math/math-renderer";
import type { AttemptResult } from "@/lib/exams/types";

export default function AdminAttemptDetailPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = use(params);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const response = await fetch(`/api/attempts/${attemptId}/result`, {
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok)
          throw new Error(payload.error?.message ?? "Không thể tải kết quả lượt thi.");
        if (!ignore) {
          setResult(payload.data.result);
        }
      } catch (cause) {
        if (!ignore) {
          setError(cause instanceof Error ? cause.message : "Không thể tải kết quả.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      ignore = true;
    };
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
        <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-sm font-semibold">Đang tải bài thi của học sinh...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-sm font-semibold text-rose-600">{error || "Không tìm thấy bài thi."}</p>
        <Link
          href="/admin/attempts"
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại lịch sử làm bài
        </Link>
      </div>
    );
  }

  const percent = result.maxScore
    ? Math.round((result.score / result.maxScore) * 100)
    : 0;

  function toggleAll() {
    if (Object.keys(expanded).length === result?.questions.length) {
      setExpanded({});
    } else {
      const all: Record<string, boolean> = {};
      result?.questions.forEach((q) => {
        all[q.id] = true;
      });
      setExpanded(all);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/attempts"
          className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Lịch sử làm bài</span>
        </Link>

        <button
          type="button"
          onClick={toggleAll}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          {Object.keys(expanded).length === result.questions.length
            ? "Thu gọn tất cả"
            : "Mở rộng tất cả câu"}
        </button>
      </div>

      {/* Score Header Card */}
      <div className="mt-6 overflow-hidden rounded-3xl border-2 border-slate-200/80 bg-white shadow-xs">
        <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl bg-amber-400 px-3 py-1 text-xs font-black text-slate-950">
              {result.exam.competition}
            </span>
            <span className="rounded-xl bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-xs">
              {result.exam.gradeLabel}
            </span>
            <span className="ml-auto rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-extrabold text-emerald-300 ring-1 ring-emerald-400">
              ĐÃ CHẤM TỰ ĐỘNG
            </span>
          </div>

          <h1 className="mt-4 font-heading text-2xl font-black sm:text-3xl text-white">
            {result.exam.title}
          </h1>

          {/* Stats 4-Grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 text-center">
            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-xs">
              <span className="text-[11px] text-blue-200">Điểm số đạt được</span>
              <p className="mt-1 font-heading text-3xl font-black text-amber-300">
                {result.score}/{result.maxScore}
              </p>
              <span className="text-xs font-bold text-white">({percent}%)</span>
            </div>
            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-xs">
              <span className="text-[11px] text-blue-200">Số câu đúng</span>
              <p className="mt-1 font-heading text-3xl font-black text-emerald-300">
                {result.correctCount}
              </p>
              <span className="text-xs text-blue-100">trên {result.questions.length} câu</span>
            </div>
            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-xs">
              <span className="text-[11px] text-blue-200">Số câu sai</span>
              <p className="mt-1 font-heading text-3xl font-black text-rose-300">
                {result.wrongCount}
              </p>
              <span className="text-xs text-blue-100">câu trả lời sai</span>
            </div>
            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-xs">
              <span className="text-[11px] text-blue-200">Bỏ trống</span>
              <p className="mt-1 font-heading text-3xl font-black text-slate-300">
                {result.skippedCount}
              </p>
              <span className="text-xs text-blue-100">chưa chọn đáp án</span>
            </div>
          </div>
        </div>
      </div>

      {/* Question by Question Inspection */}
      <div className="mt-8">
        <h2 className="font-heading text-xl font-bold text-slate-900">
          Chi tiết từng câu hỏi & Bài làm của học sinh
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          So sánh lựa chọn của thí sinh với đáp án chuẩn được giải mã.
        </p>

        <div className="mt-6 space-y-4">
          {result.questions.map((q) => {
            const isOpen = !!expanded[q.id];
            const isCorrect = q.isCorrect;
            const isSkipped = !q.selectedAnswer;

            return (
              <article
                key={q.id}
                className={`overflow-hidden rounded-3xl border-2 bg-white shadow-xs transition ${
                  isCorrect
                    ? "border-emerald-200"
                    : isSkipped
                      ? "border-slate-200"
                      : "border-rose-200"
                }`}
              >
                {/* Accordion Trigger */}
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((curr) => ({ ...curr, [q.id]: !curr[q.id] }))
                  }
                  className="flex w-full items-center gap-4 p-5 text-left hover:bg-slate-50/60"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-heading text-sm font-black text-white ${
                      isCorrect
                        ? "bg-emerald-600"
                        : isSkipped
                          ? "bg-slate-400"
                          : "bg-rose-600"
                    }`}
                  >
                    {q.position}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-slate-900">
                        Câu {q.position}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {q.category}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Học sinh chọn:{" "}
                      <strong className={isCorrect ? "text-emerald-700" : "text-rose-700"}>
                        {q.selectedAnswer || "Bỏ trống"}
                      </strong>{" "}
                      • Đáp án chuẩn: <strong className="text-emerald-700">{q.correctAnswer}</strong> •{" "}
                      Đạt: <strong>{q.awardedPoints}/{q.points} điểm</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="hidden sm:inline">Đúng</span>
                      </span>
                    ) : isSkipped ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                        <span className="hidden sm:inline">Bỏ trống</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-rose-600">
                        <XCircle className="h-5 w-5" />
                        <span className="hidden sm:inline">Sai</span>
                      </span>
                    )}

                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Question Body & Options */}
                {isOpen && (
                  <div className="border-t border-slate-100 p-6 sm:p-7">
                    <div className="text-sm text-slate-900 leading-relaxed">
                      <MathRenderer content={q.bodyMd} />
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {q.options.map((opt) => {
                        const isChosen = opt.id === q.selectedAnswer;
                        const isAnswerKey = opt.id === q.correctAnswer;

                        let borderStyle = "border-slate-200 bg-slate-50/50";
                        if (isAnswerKey) {
                          borderStyle = "border-emerald-500 bg-emerald-50/70";
                        } else if (isChosen && !isAnswerKey) {
                          borderStyle = "border-rose-400 bg-rose-50/70";
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`flex items-start gap-3 rounded-2xl border-2 p-3.5 text-xs ${borderStyle}`}
                          >
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-black ${
                                isAnswerKey
                                  ? "bg-emerald-600 text-white"
                                  : isChosen
                                    ? "bg-rose-600 text-white"
                                    : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {opt.label}
                            </span>
                            <div className="min-w-0 flex-1 pt-0.5 font-medium text-slate-900">
                              <MathRenderer content={opt.text} />
                            </div>
                            {isAnswerKey && (
                              <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black text-white">
                                ĐÚNG
                              </span>
                            )}
                            {isChosen && !isAnswerKey && (
                              <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[9px] font-black text-white">
                                ĐÃ CHỌN
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanationMd && (
                      <div className="mt-5 rounded-2xl bg-indigo-50/70 p-4 text-xs text-indigo-950">
                        <span className="font-bold">Ghi chú & Lời giải: </span>
                        <MathRenderer content={q.explanationMd} />
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
