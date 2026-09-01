"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clock,
  FileQuestion,
  GraduationCap,
  GitBranch,
  LoaderCircle,
  PencilLine,
  Play,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { MathRenderer } from "@/components/math/math-renderer";

interface QuestionOption {
  id: string;
  label: string;
  text: string;
}

interface Question {
  id: string;
  position: number;
  code: string;
  type: string;
  points: number;
  pointsWrong: number;
  category: string;
  bodyMd: string;
  options: QuestionOption[];
  correctAnswer: string;
  rawCorrectKeyEncrypted: boolean;
  explanationMd: string;
  imagePaths: string[];
  tags: string[];
}

interface ExamDetailData {
  id: string;
  title: string;
  competition: string;
  round: string | null;
  schoolYear: string | null;
  grade_min: number;
  grade_max: number;
  status: "draft" | "published" | "archived";
  source_url: string | null;
  rights_note: string | null;
  version: {
    id: string;
    version_no: number;
    duration_seconds: number;
    scoring_policy: Record<string, unknown>;
    raw_source_path: string;
    compiled_hash: string;
    published_at: string | null;
    created_at: string;
  } | null;
  questions: Question[];
  attemptCount: number;
}

interface VersionSummary {
  id: string;
  versionNo: number;
  lifecycle: "draft" | "published";
  isCurrent: boolean;
  durationMinutes: number;
  questionCount: number;
  maxScore: number;
  createdAt: string;
  publishedAt: string | null;
  sourcePath: string | null;
}

export default function AdminExamDetailPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = use(params);
  const router = useRouter();
  const [exam, setExam] = useState<ExamDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [updating, setUpdating] = useState(false);
  const [versions, setVersions] = useState<VersionSummary[]>([]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch(`/api/admin/exams/${examId}`, {
          cache: "no-store",
        });
        const payload = await res.json();
        if (!res.ok)
          throw new Error(
            payload.error?.message || "Không thể tải chi tiết đề thi.",
          );
        const versionsResponse = await fetch(
          `/api/admin/exams/${examId}/versions`,
          { cache: "no-store" },
        );
        const versionsPayload = await versionsResponse.json();
        if (!versionsResponse.ok)
          throw new Error(
            versionsPayload.error?.message || "Không thể tải phiên bản đề.",
          );
        if (!ignore) {
          setExam(payload.data.exam);
          setVersions(versionsPayload.data.versions);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
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
  }, [examId]);

  async function cloneAsDraft(sourceVersionId: string) {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/exams/${examId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceVersionId }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error?.message || "Không thể tạo bản nháp.");
      router.push(`/admin/exams/${examId}/versions/${payload.data.versionId}`);
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : "Không thể tạo bản nháp.");
      setUpdating(false);
    }
  }

  const categories = exam
    ? Array.from(new Set(exam.questions.map((q) => q.category).filter(Boolean)))
    : [];

  const filteredQuestions = exam
    ? exam.questions.filter(
        (q) => categoryFilter === "all" || q.category === categoryFilter,
      )
    : [];

  const totalPoints = exam
    ? exam.questions.reduce((sum, q) => sum + (q.points || 0), 0)
    : 0;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
        <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-sm font-semibold">
          Đang tải đề thi và giải mã đáp án...
        </span>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-sm font-semibold text-rose-600">
          {error || "Không tìm thấy đề thi."}
        </p>
        <Link
          href="/admin/exams"
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách đề
        </Link>
      </div>
    );
  }

  const isPub = exam.status === "published";
  const durationMins = exam.version
    ? Math.ceil(exam.version.duration_seconds / 60)
    : 90;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/exams"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Danh sách đề</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-bold text-slate-500 truncate max-w-xs sm:max-w-md">
            {exam.title}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {isPub && (
            <Link
              href={`/student/exams/${exam.id}`}
              target="_blank"
              className="tactile-btn inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Thi thử ngay</span>
            </Link>
          )}
        </div>
      </div>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-blue-600" />
              <h2 className="font-heading text-lg font-black text-slate-950">
                Các phiên bản
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Mỗi bản nháp độc lập; xuất bản một version không xóa các draft
              khác.
            </p>
          </div>
          {exam.version && (
            <button
              type="button"
              disabled={updating}
              onClick={() => void cloneAsDraft(exam.version!.id)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-extrabold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              <PencilLine className="h-4 w-4" /> Tạo bản nháp từ bản hiện tại
            </button>
          )}
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {versions.map((version) => (
            <article
              key={version.id}
              className={`rounded-2xl border-2 p-4 ${version.isCurrent ? "border-emerald-300 bg-emerald-50/50" : version.lifecycle === "draft" ? "border-amber-200 bg-amber-50/40" : "border-slate-200"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm text-slate-950">
                      Version {version.versionNo}
                    </strong>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${version.lifecycle === "draft" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}
                    >
                      {version.lifecycle === "draft"
                        ? "BẢN NHÁP"
                        : version.isCurrent
                          ? "ĐANG PHỤC VỤ"
                          : "ĐÃ XUẤT BẢN"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {version.questionCount} câu • {version.maxScore} điểm •{" "}
                    {version.durationMinutes} phút
                  </p>
                  <p className="mt-1 truncate font-mono text-[10px] text-slate-400">
                    {version.sourcePath || "Tạo từ editor"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/exams/${examId}/versions/${version.id}`}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    {version.lifecycle === "draft" ? (
                      <PencilLine className="h-3.5 w-3.5" />
                    ) : (
                      <FileQuestion className="h-3.5 w-3.5" />
                    )}
                    {version.lifecycle === "draft" ? "Chỉnh sửa" : "Xem"}
                  </Link>
                  {version.lifecycle === "published" && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => void cloneAsDraft(version.id)}
                      className="min-h-10 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-blue-700"
                    >
                      Tạo nháp
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Exam Header Overview Card */}
      <div className="mt-6 overflow-hidden rounded-3xl border-2 border-slate-200/80 bg-white shadow-xs">
        <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl bg-amber-400 px-3 py-1 text-xs font-black text-slate-950">
              {exam.competition}
            </span>
            <span className="rounded-xl bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-xs">
              Lớp{" "}
              {exam.grade_min === exam.grade_max
                ? exam.grade_min
                : `${exam.grade_min}–${exam.grade_max}`}
            </span>
            {exam.round && (
              <span className="rounded-xl bg-white/10 px-3 py-1 text-xs text-blue-200">
                {exam.round}
              </span>
            )}
            {exam.schoolYear && (
              <span className="text-xs text-slate-300">
                Năm: {exam.schoolYear}
              </span>
            )}
            <span
              className={`ml-auto rounded-full px-3 py-1 text-xs font-extrabold ${
                isPub
                  ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400"
                  : "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400"
              }`}
            >
              {isPub ? "ĐÃ XUẤT BẢN" : "BẢN NHÁP"}
            </span>
          </div>

          <h1 className="mt-4 font-heading text-2xl font-black sm:text-3xl text-white">
            {exam.title}
          </h1>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-xs">
              <Clock className="h-5 w-5 text-blue-300" />
              <p className="mt-1 font-heading text-lg font-bold">
                {durationMins} phút
              </p>
              <span className="text-[10px] text-blue-200">
                Thời gian làm bài
              </span>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-xs">
              <FileQuestion className="h-5 w-5 text-indigo-300" />
              <p className="mt-1 font-heading text-lg font-bold">
                {exam.questions.length} câu
              </p>
              <span className="text-[10px] text-blue-200">Tổng số câu hỏi</span>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-xs">
              <Trophy className="h-5 w-5 text-amber-300" />
              <p className="mt-1 font-heading text-lg font-bold">
                {totalPoints} điểm
              </p>
              <span className="text-[10px] text-blue-200">Điểm tối đa</span>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-xs">
              <GraduationCap className="h-5 w-5 text-emerald-300" />
              <p className="mt-1 font-heading text-lg font-bold">
                {exam.attemptCount}
              </p>
              <span className="text-[10px] text-blue-200">
                Lượt học sinh thi
              </span>
            </div>
          </div>
        </div>

        {/* Version & Technical Spec Bar */}
        {exam.version && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/80 px-6 py-3 text-xs text-slate-500 font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>
                Phiên bản v{exam.version.version_no} (Mã hash:{" "}
                {exam.version.compiled_hash.slice(0, 12)}...)
              </span>
            </div>
            <div>
              <span>Nguồn: {exam.version.raw_source_path}</span>
            </div>
          </div>
        )}
      </div>

      {/* Category Tabs & Question Filter */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-xl font-bold text-slate-900">
            Chi tiết Ngân hàng Câu hỏi ({filteredQuestions.length})
          </h2>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
            Đã giải mã đáp án cho Admin
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              categoryFilter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Tất cả ({exam.questions.length})
          </button>
          {categories.map((cat) => {
            const count = exam.questions.filter(
              (q) => q.category === cat,
            ).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  categoryFilter === cat
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Cards Feed */}
      <div className="mt-6 space-y-6">
        {filteredQuestions.map((q) => (
          <article
            key={q.id}
            className="overflow-hidden rounded-3xl border-2 border-slate-200/90 bg-white shadow-xs"
          >
            {/* Question Top Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-6 py-3.5">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 font-heading text-sm font-extrabold text-white">
                  {q.position}
                </span>
                <div>
                  <span className="font-heading text-sm font-bold text-slate-900">
                    Câu {q.position}
                  </span>
                  <span className="ml-2 font-mono text-xs text-slate-400">
                    ({q.code})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                  {q.category}
                </span>
                <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-800">
                  +{q.points} điểm
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-200">
                  <Check className="h-3.5 w-3.5" /> Đáp án: {q.correctAnswer}
                </span>
              </div>
            </div>

            {/* Question Body (LaTeX / Markdown) */}
            <div className="p-6 sm:p-8">
              <div className="text-base text-slate-900 leading-relaxed">
                <MathRenderer content={q.bodyMd} />
              </div>

              {/* 4 Choices Grid */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {q.options.map((opt) => {
                  const isCorrect = opt.id === q.correctAnswer;
                  return (
                    <div
                      key={opt.id}
                      className={`relative flex items-start gap-3 rounded-2xl border-2 p-4 transition ${
                        isCorrect
                          ? "border-emerald-500 bg-emerald-50/70 shadow-xs"
                          : "border-slate-200 bg-slate-50/40"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                          isCorrect
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {opt.label}
                      </span>
                      <div className="min-w-0 flex-1 text-sm font-medium text-slate-900 pt-0.5">
                        <MathRenderer content={opt.text} />
                      </div>
                      {isCorrect && (
                        <span className="absolute right-3 top-3 rounded-full bg-emerald-600 p-0.5 text-white">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation Note */}
              {q.explanationMd && (
                <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs text-indigo-950">
                  <span className="font-bold">Ghi chú & Hướng dẫn giải: </span>
                  <MathRenderer content={q.explanationMd} />
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
