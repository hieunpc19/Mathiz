"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, FileQuestion, LoaderCircle, Play, Search, Trophy } from "lucide-react";
import type { ExamSummary } from "@/lib/exams/types";

export default function StudentExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/exams", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Không thể tải đề thi.");
        setExams(payload.data.exams);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không thể tải đề thi.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi");
    if (!normalized) return exams;
    return exams.filter((exam) =>
      [exam.title, exam.subtitle, exam.competition, exam.description]
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(normalized),
    );
  }, [exams, query]);

  async function startExam(examId: string) {
    setStartingId(examId);
    setError(null);
    try {
      const response = await fetch(`/api/exams/${examId}/attempts`, { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Không thể bắt đầu bài thi.");
      router.push(`/student/attempts/${payload.data.attemptId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể bắt đầu bài thi.");
      setStartingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <section className="border-b border-blue-200/60 bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-md">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
          <div className="flex items-center gap-3">
            <Trophy className="h-10 w-10 text-amber-300" />
            <div>
              <p className="text-sm font-bold text-blue-100">Đấu trường Toán học Mathiz • Lớp 1–5</p>
              <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">Luyện thi Olympic Toán</h1>
              <p className="mt-2 text-blue-100">Đề thi thật, lưu bài và chấm điểm trực tiếp trên hệ thống.</p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="relative block max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên đề hoặc kỳ thi..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" />
          </label>
        </div>

        {error && <p className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p>}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-slate-500"><LoaderCircle className="h-6 w-6 animate-spin" /> Đang tải đề thi từ Supabase...</div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {filtered.map((exam) => (
              <article key={exam.id} className="overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="bg-linear-to-r from-blue-600 to-indigo-700 p-6 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-xl bg-white/15 px-3 py-1 text-xs font-bold">{exam.gradeLabel}</span>
                    <span className="rounded-xl bg-amber-300 px-3 py-1 text-xs font-extrabold text-slate-900">{exam.competition}</span>
                  </div>
                  <h2 className="mt-4 font-heading text-xl font-extrabold">{exam.title}</h2>
                  <p className="mt-2 text-sm text-blue-100">{exam.subtitle}</p>
                </div>
                <div className="p-6">
                  <p className="text-sm leading-6 text-slate-600">{exam.description}</p>
                  <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3"><Clock className="mx-auto h-5 w-5 text-blue-600" /><strong className="mt-1 block">{exam.durationMinutes} phút</strong></div>
                    <div className="rounded-2xl bg-slate-50 p-3"><FileQuestion className="mx-auto h-5 w-5 text-indigo-600" /><strong className="mt-1 block">{exam.totalQuestions} câu</strong></div>
                    <div className="rounded-2xl bg-slate-50 p-3"><Trophy className="mx-auto h-5 w-5 text-amber-600" /><strong className="mt-1 block">{exam.totalPoints} điểm</strong></div>
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <button
                      onClick={() => router.push(`/student/practice/${exam.id}`)}
                      className="tactile-btn flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">🎯</span>
                      <span>Luyện tập tức thì</span>
                    </button>

                    <button
                      disabled={startingId === exam.id}
                      onClick={() => startExam(exam.id)}
                      className="tactile-btn flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-60 transition cursor-pointer"
                    >
                      {startingId === exam.id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 fill-current" />
                      )}
                      <span>Bắt đầu thi thử</span>
                    </button>
                  </div>
                  <div className="mt-2.5 text-center">
                    <button
                      onClick={() => router.push(`/student/exams/${exam.id}`)}
                      className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
                    >
                      Xem quy chế & thông tin chi tiết đề thi →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && <p className="py-20 text-center text-slate-500">Không tìm thấy đề phù hợp.</p>}
      </main>
    </div>
  );
}
