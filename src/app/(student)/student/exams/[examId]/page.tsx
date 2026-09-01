"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileQuestion,
  LoaderCircle,
  Play,
  Trophy,
  Sparkles,
  Zap,
  ShieldCheck,
} from "lucide-react";
import type { ExamDetail } from "@/lib/exams/types";

export default function StudentExamDetailPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = use(params);
  const router = useRouter();
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch(`/api/exams/${examId}`, { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Không thể tải đề thi.");
        setExam(payload.data.exam);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không thể tải đề thi.");
      } finally {
        setLoading(false);
      }
    })();
  }, [examId]);

  async function startExam() {
    setStarting(true);
    setError(null);
    try {
      const response = await fetch(`/api/exams/${examId}/attempts`, { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Không thể bắt đầu bài thi.");
      router.push(`/student/attempts/${payload.data.attemptId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể bắt đầu bài thi.");
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-slate-100 text-slate-600 font-medium">
        <LoaderCircle className="h-6 w-6 animate-spin text-blue-600" />
        Đang tải thông tin đề thi...
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-slate-100 p-10 text-center text-rose-700 font-bold">
        {error ?? "Không tìm thấy đề thi."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/student/exams"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách đề
        </Link>

        <div className="mt-6 overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-xl">
          {/* Header Banner */}
          <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 p-7 text-white sm:p-9">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-xl bg-white/20 px-3 py-1 text-xs font-bold">
                {exam.gradeLabel}
              </span>
              <span className="rounded-xl bg-amber-300 px-3 py-1 text-xs font-extrabold text-slate-900">
                {exam.competition}
              </span>
            </div>
            <h1 className="mt-4 font-heading text-2xl font-extrabold sm:text-3xl">
              {exam.title}
            </h1>
            <p className="mt-2 text-blue-100">{exam.subtitle}</p>
          </div>

          <div className="p-6 sm:p-8">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <div>
                <Clock className="mx-auto h-5 w-5 text-blue-600" />
                <strong className="mt-1 block text-lg font-heading">{exam.durationMinutes} phút</strong>
                <span className="text-xs text-slate-500">Thời gian làm bài</span>
              </div>
              <div className="border-x border-slate-200">
                <FileQuestion className="mx-auto h-5 w-5 text-indigo-600" />
                <strong className="mt-1 block text-lg font-heading">{exam.totalQuestions} câu</strong>
                <span className="text-xs text-slate-500">Tổng số câu hỏi</span>
              </div>
              <div>
                <Trophy className="mx-auto h-5 w-5 text-amber-600" />
                <strong className="mt-1 block text-lg font-heading">{exam.totalPoints} điểm</strong>
                <span className="text-xs text-slate-500">Thang điểm tối đa</span>
              </div>
            </div>

            <p className="mt-6 leading-7 text-slate-600">{exam.description}</p>

            <h2 className="mt-7 font-heading text-lg font-bold text-slate-900">Quy định làm bài</h2>
            <ul className="mt-3 space-y-2.5">
              {exam.rules.map((rule) => (
                <li key={rule} className="flex gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>

            {error && (
              <p className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                {error}
              </p>
            )}

            {/* Mode Selection Cards */}
            <div className="mt-9">
              <h3 className="text-center font-heading text-lg font-black text-slate-900 sm:text-xl">
                Chọn chế độ làm bài
              </h3>
              <p className="mt-1 text-center text-xs text-slate-500">
                Lựa chọn chế độ phù hợp với mục tiêu học tập của em hôm nay
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {/* 1. Instant Practice Mode */}
                <div className="flex flex-col justify-between rounded-3xl border-2 border-emerald-500 bg-emerald-50/50 p-5 shadow-sm transition hover:shadow-md">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white text-lg">
                        🎯
                      </span>
                      <span className="rounded-full bg-emerald-200/80 px-2.5 py-1 text-[11px] font-extrabold text-emerald-900">
                        Khuyên dùng khi học
                      </span>
                    </div>
                    <h4 className="mt-3 font-heading text-lg font-bold text-emerald-950">
                      Luyện tập tức thì
                    </h4>
                    <ul className="mt-2.5 space-y-1.5 text-xs text-emerald-900">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Biết ngay Đúng / Sai sau khi bấm chọn</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Chọn sai được suy nghĩ và chọn lại</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Có đếm ngược thời gian rèn luyện phản xạ</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => router.push(`/student/practice/${exam.id}`)}
                    className="tactile-btn tactile-btn-emerald mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-black text-white hover:bg-emerald-700 transition cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Vào Luyện tập ngay</span>
                  </button>
                </div>

                {/* 2. Standard Exam Mode */}
                <div className="flex flex-col justify-between rounded-3xl border-2 border-blue-500 bg-blue-50/50 p-5 shadow-sm transition hover:shadow-md">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white text-lg">
                        🏆
                      </span>
                      <span className="rounded-full bg-blue-200/80 px-2.5 py-1 text-[11px] font-extrabold text-blue-900">
                        Tính điểm xếp hạng
                      </span>
                    </div>
                    <h4 className="mt-3 font-heading text-lg font-bold text-blue-950">
                      Thi thử chuẩn
                    </h4>
                    <ul className="mt-2.5 space-y-1.5 text-xs text-blue-900">
                      <li className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span>Mô phỏng phòng thi Olympic thật</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span>Chấm điểm và lưu kết quả sau khi nộp</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span>Giới hạn thời gian nghiêm ngặt</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    disabled={starting}
                    onClick={startExam}
                    className="tactile-btn tactile-btn-blue mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60 transition cursor-pointer"
                  >
                    {starting ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 fill-current" />
                    )}
                    <span>Bắt đầu Thi thử</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
