"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  BookOpen,
  Clock,
  Eye,
  FilePlus2,
  FileQuestion,
  History,
  LoaderCircle,
  Play,
  RefreshCw,
  Search,
  Trash2,
  Trophy,
} from "lucide-react";

interface AdminExam {
  id: string;
  title: string;
  subtitle: string;
  competition: string;
  gradeMin: number;
  gradeMax: number;
  gradeLabel: string;
  durationMinutes: number;
  totalQuestions: number;
  totalPoints: number;
  difficulty: string;
  description: string;
  status: "draft" | "published" | "archived";
  round: string | null;
  schoolYear: string | null;
  languages: string[];
  createdAt: string;
  questionCount: number;
  attemptCount: number;
}

export default function AdminExamsPage() {
  const [exams, setExams] = useState<AdminExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [competitionFilter, setCompetitionFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleRefresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/exams", { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok)
        throw new Error(
          payload.error?.message || "Không thể tải danh sách đề thi.",
        );
      setExams(payload.data.exams || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    async function loadInitial() {
      try {
        const res = await fetch("/api/admin/exams", { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok)
          throw new Error(
            payload.error?.message || "Không thể tải danh sách đề thi.",
          );
        if (!ignore) {
          setExams(payload.data.exams || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    void loadInitial();
    return () => {
      ignore = true;
    };
  }, []);

  async function toggleStatus(examId: string, currentStatus: string) {
    const nextStatus = currentStatus === "published" ? "draft" : "published";
    setUpdatingId(examId);
    try {
      const res = await fetch(`/api/admin/exams/${examId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = await res.json();
      if (!res.ok)
        throw new Error(payload.error?.message || "Không thể đổi trạng thái.");

      setExams((current) =>
        current.map((e) =>
          e.id === examId ? { ...e, status: nextStatus } : e,
        ),
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Không thể cập nhật trạng thái đề thi.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteExam(examId: string, title: string) {
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa đề thi "${title}" không? Hành động này không thể hoàn tác.`,
      )
    ) {
      return;
    }

    setUpdatingId(examId);
    try {
      const res = await fetch(`/api/admin/exams/${examId}`, {
        method: "DELETE",
      });
      const payload = await res.json();
      if (!res.ok)
        throw new Error(payload.error?.message || "Không thể xóa đề thi.");

      setExams((current) => current.filter((e) => e.id !== examId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể xóa đề thi.");
    } finally {
      setUpdatingId(null);
    }
  }

  const competitions = useMemo(() => {
    return Array.from(new Set(exams.map((e) => e.competition).filter(Boolean)));
  }, [exams]);

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchSearch =
        !searchQuery.trim() ||
        [
          exam.title,
          exam.subtitle,
          exam.competition,
          exam.round,
          exam.schoolYear,
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase().trim());

      const matchStatus =
        statusFilter === "all" || exam.status === statusFilter;
      const matchComp =
        competitionFilter === "all" || exam.competition === competitionFilter;

      return matchSearch && matchStatus && matchComp;
    });
  }, [exams, searchQuery, statusFilter, competitionFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-black text-slate-900 sm:text-3xl">
            Quản lý Đề thi Olympic
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Xem danh sách đề thi, kiểm duyệt câu hỏi, tùy chỉnh xuất bản và quản
            lý phiên bản đề.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => void handleRefresh()}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </button>
          <Link
            href="/admin/exams/import"
            className="tactile-btn inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
          >
            <FilePlus2 className="h-4 w-4" />
            <span>Import đề mới</span>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên đề, giải đấu hoặc năm học..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
              Trạng thái:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả ({exams.length})</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
              <option value="archived">Lưu trữ</option>
            </select>
          </div>

          {/* Competition Filter */}
          {competitions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                Giải đấu:
              </span>
              <select
                value={competitionFilter}
                onChange={(e) => setCompetitionFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="all">Tất cả giải</option>
                {competitions.map((comp) => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Exam Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-sm font-semibold">
            Đang tải danh sách đề thi...
          </span>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 font-heading text-base font-bold text-slate-800">
            Không tìm thấy đề thi phù hợp
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Hãy thử thay đổi bộ lọc tìm kiếm hoặc import gói đề thi mới vào hệ
            thống.
          </p>
          <div className="mt-5">
            <Link
              href="/admin/exams/import"
              className="tactile-btn inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
            >
              <FilePlus2 className="h-4 w-4" />
              <span>Import đề thi ngay</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {filteredExams.map((exam) => {
            const isPub = exam.status === "published";
            const isUpdating = updatingId === exam.id;

            return (
              <article
                key={exam.id}
                className="tactile-card flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-slate-200/80 bg-white shadow-xs"
              >
                <div>
                  {/* Card Header Banner */}
                  <div className="flex items-start justify-between bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-amber-400 px-2.5 py-0.5 text-[11px] font-extrabold text-slate-950">
                          {exam.competition}
                        </span>
                        <span className="rounded-lg bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-xs">
                          {exam.gradeLabel}
                        </span>
                        {exam.round && (
                          <span className="rounded-lg bg-white/10 px-2.5 py-0.5 text-[11px] text-blue-200">
                            {exam.round}
                          </span>
                        )}
                        {exam.schoolYear && (
                          <span className="text-[11px] text-slate-300">
                            Năm học: {exam.schoolYear}
                          </span>
                        )}
                      </div>
                      <h2 className="mt-3 font-heading text-lg font-black text-white leading-snug">
                        {exam.title}
                      </h2>
                      <p className="mt-1 text-xs text-slate-300 line-clamp-1">
                        {exam.subtitle}
                      </p>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[11px] font-extrabold ${
                        isPub
                          ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40"
                          : exam.status === "draft"
                            ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/40"
                            : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {isPub
                        ? "ĐÃ XUẤT BẢN"
                        : exam.status === "draft"
                          ? "BẢN NHÁP"
                          : "LƯU TRỮ"}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    {/* Metrics 4-grid */}
                    <div className="grid grid-cols-4 gap-2 rounded-2xl bg-slate-50 p-3 text-center text-xs">
                      <div>
                        <Clock className="mx-auto h-4 w-4 text-blue-600" />
                        <span className="mt-1 block font-bold text-slate-900">
                          {exam.durationMinutes} phút
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Thời gian
                        </span>
                      </div>
                      <div className="border-l border-slate-200">
                        <FileQuestion className="mx-auto h-4 w-4 text-indigo-600" />
                        <span className="mt-1 block font-bold text-slate-900">
                          {exam.questionCount || exam.totalQuestions} câu
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Số câu
                        </span>
                      </div>
                      <div className="border-l border-slate-200">
                        <Trophy className="mx-auto h-4 w-4 text-amber-600" />
                        <span className="mt-1 block font-bold text-slate-900">
                          {exam.totalPoints} đ
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Tổng điểm
                        </span>
                      </div>
                      <div className="border-l border-slate-200">
                        <History className="mx-auto h-4 w-4 text-emerald-600" />
                        <span className="mt-1 block font-bold text-slate-900">
                          {exam.attemptCount}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Lượt thi
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 text-xs leading-relaxed text-slate-600 line-clamp-2">
                      {exam.description ||
                        "Đề thi Olympic Toán song ngữ tiêu chuẩn."}
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 p-4">
                  {/* Published exams may be hidden; publishing a draft happens in the validated editor. */}
                  {isPub ? (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => void toggleStatus(exam.id, exam.status)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Archive className="h-3.5 w-3.5" />
                      )}
                      <span>Ẩn khỏi sảnh thi</span>
                    </button>
                  ) : (
                    <span className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
                      Mở đề để chọn version xuất bản
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    {/* Test Exam as student link */}
                    <Link
                      href={`/student/exams/${exam.id}`}
                      target="_blank"
                      title="Thi thử"
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                    >
                      <Play className="h-4 w-4" />
                    </Link>

                    {/* View Details / Question Inspector */}
                    <Link
                      href={`/admin/exams/${exam.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Xem câu hỏi</span>
                    </Link>

                    {/* Delete button */}
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => void deleteExam(exam.id, exam.title)}
                      title="Xóa đề"
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
