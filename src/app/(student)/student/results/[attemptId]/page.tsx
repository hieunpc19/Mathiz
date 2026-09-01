"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, ChevronUp, Home, LoaderCircle, XCircle } from "lucide-react";
import type { AttemptResult } from "@/lib/exams/types";
import { MathRenderer } from "@/components/math/math-renderer";

export default function StudentResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(params);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch(`/api/attempts/${attemptId}/result`, { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Không thể tải kết quả.");
        setResult(payload.data.result);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không thể tải kết quả.");
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId]);

  if (loading) return <div className="flex min-h-screen items-center justify-center gap-2 bg-slate-100 text-slate-600"><LoaderCircle className="h-6 w-6 animate-spin" /> Đang tải kết quả từ Supabase...</div>;
  if (!result) return <div className="min-h-screen bg-slate-100 p-10 text-center text-rose-700">{error ?? "Không tìm thấy kết quả."}</div>;

  const percent = result.maxScore ? Math.round((result.score / result.maxScore) * 100) : 0;
  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <section className="bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 px-4 py-10 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-bold text-blue-100">Đã chấm bài trên hệ thống</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold">{result.exam.title}</h1>
          <div className="mx-auto mt-7 flex h-36 w-36 flex-col items-center justify-center rounded-full border-8 border-white/20 bg-white/10 shadow-xl">
            <strong className="font-heading text-4xl">{result.score}/{result.maxScore}</strong>
            <span className="text-sm text-blue-100">{percent}%</span>
          </div>
          <div className="mx-auto mt-7 grid max-w-2xl grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/10 p-3"><strong className="block text-2xl text-emerald-300">{result.correctCount}</strong><span className="text-xs">Đúng</span></div>
            <div className="rounded-2xl bg-white/10 p-3"><strong className="block text-2xl text-rose-300">{result.wrongCount}</strong><span className="text-xs">Sai</span></div>
            <div className="rounded-2xl bg-white/10 p-3"><strong className="block text-2xl text-slate-200">{result.skippedCount}</strong><span className="text-xs">Bỏ trống</span></div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        <div className="flex justify-end"><Link href="/student/exams" className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm"><Home className="h-4 w-4" /> Danh sách đề</Link></div>
        <h2 className="mt-6 font-heading text-2xl font-extrabold text-slate-900">Chi tiết bài làm</h2>
        <p className="mt-1 text-sm text-slate-500">Đáp án chuẩn chỉ xuất hiện sau khi bài đã được nộp và chấm.</p>
        <div className="mt-5 space-y-4">
          {result.questions.map((question) => {
            const isOpen = !!expanded[question.id];
            return (
              <article key={question.id} className={`overflow-hidden rounded-3xl border-2 bg-white shadow-sm ${question.isCorrect ? "border-emerald-200" : "border-rose-200"}`}>
                <button onClick={() => setExpanded((current) => ({ ...current, [question.id]: !current[question.id] }))} className="flex w-full items-center gap-4 p-5 text-left">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-bold text-white ${question.isCorrect ? "bg-emerald-600" : "bg-rose-600"}`}>{question.position}</span>
                  <div className="min-w-0 flex-1"><p className="font-bold text-slate-900">Câu {question.position} • {question.category}</p><p className="mt-1 text-sm text-slate-500">Đã chọn: {question.selectedAnswer ?? "Bỏ trống"} • Đáp án: {question.correctAnswer} • {question.awardedPoints}/{question.points} điểm</p></div>
                  {question.isCorrect ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : <XCircle className="h-6 w-6 text-rose-600" />}
                  {isOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                </button>
                {isOpen && <div className="border-t border-slate-100 p-5 sm:p-7"><MathRenderer content={question.bodyMd} className="text-base" /><div className="mt-5 grid gap-3 sm:grid-cols-2">{question.options.map((option) => <div key={option.id} className={`rounded-2xl border-2 p-4 ${option.id === question.correctAnswer ? "border-emerald-400 bg-emerald-50" : option.id === question.selectedAnswer ? "border-rose-300 bg-rose-50" : "border-slate-200"}`}><div className="flex gap-3"><strong>{option.label}.</strong><MathRenderer content={option.text} /></div></div>)}</div><div className="mt-5 rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-900"><strong>Ghi chú:</strong> {question.explanationMd}</div></div>}
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
