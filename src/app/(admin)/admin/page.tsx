"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FilePlus2,
  FileQuestion,
  GraduationCap,
  History,
  LoaderCircle,
  RefreshCw,
  Trophy,
  Users,
} from "lucide-react";

interface AdminStats {
  totalExams: number;
  publishedExams: number;
  draftExams: number;
  totalQuestions: number;
  totalStudents: number;
  totalAttempts: number;
  completedAttempts: number;
  averageScorePercent: number;
}

interface RecentAttempt {
  id: string;
  studentName: string;
  studentPhone: string;
  studentGrade: number | null;
  examTitle: string;
  competition: string;
  status: string;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  maxScore: number | null;
  durationSeconds: number | null;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<RecentAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRefresh() {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error?.message || "Không thể tải số liệu.");
      setStats(payload.data.stats);
      setRecentAttempts(payload.data.recentAttempts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    async function loadInitial() {
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error?.message || "Không thể tải số liệu.");
        if (!ignore) {
          setStats(payload.data.stats);
          setRecentAttempts(payload.data.recentAttempts || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Không thể tải dữ liệu.");
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

  function formatTime(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  }

  function formatDuration(seconds: number | null) {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}p ${secs}s`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hệ thống đang hoạt động</span>
          </div>
          <h1 className="mt-1 font-heading text-2xl font-black text-slate-900 sm:text-3xl">
            Bảng điều khiển Quản trị
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Giám sát đề thi Olympic Toán, ngân hàng câu hỏi và tiến độ luyện thi của học sinh.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-slate-500 ${refreshing ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </button>
          <Link
            href="/admin/exams/import"
            className="tactile-btn inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
          >
            <FilePlus2 className="h-4 w-4" />
            <span>Import đề thi mới</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Loading Skeleton / KPI Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-sm font-semibold">Đang tải số liệu hệ thống...</span>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Exams */}
            <div className="tactile-card rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Tổng số đề thi</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 font-heading text-3xl font-black text-slate-900">
                {stats?.totalExams ?? 0}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                  {stats?.publishedExams ?? 0} Đã xuất bản
                </span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
                  {stats?.draftExams ?? 0} Bản nháp
                </span>
              </div>
            </div>

            {/* Total Questions */}
            <div className="tactile-card rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Ngân hàng câu hỏi</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <FileQuestion className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 font-heading text-3xl font-black text-slate-900">
                {stats?.totalQuestions ?? 0}
              </p>
              <div className="mt-3 text-xs text-slate-500">
                <span>Trắc nghiệm 4 đáp án & mã hóa đáp án</span>
              </div>
            </div>

            {/* Total Students */}
            <div className="tactile-card rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Học sinh đăng ký</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <GraduationCap className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 font-heading text-3xl font-black text-slate-900">
                {stats?.totalStudents ?? 0}
              </p>
              <div className="mt-3 text-xs text-slate-500">
                <span>Khối lớp 1 đến 5 toàn quốc</span>
              </div>
            </div>

            {/* Attempts & Avg Score */}
            <div className="tactile-card rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Điểm TB / Lượt thi</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <Trophy className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-heading text-3xl font-black text-slate-900">
                  {stats?.averageScorePercent ?? 0}%
                </span>
                <span className="text-xs font-bold text-slate-500">
                  ({stats?.completedAttempts ?? 0}/{stats?.totalAttempts ?? 0} bài)
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                <span>Tỷ lệ hoàn thành xuất sắc</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Short Navigation */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Link
              href="/admin/exams"
              className="tactile-card flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-500"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Quản lý Đề thi</h3>
                  <p className="text-[11px] text-slate-500">Xem câu hỏi, công thức LaTeX & xuất bản</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              href="/admin/students"
              className="tactile-card flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-500"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Danh sách Học sinh</h3>
                  <p className="text-[11px] text-slate-500">Theo dõi hồ sơ & kết quả học tập</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              href="/admin/attempts"
              className="tactile-card flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-500"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Lịch sử Làm bài</h3>
                  <p className="text-[11px] text-slate-500">Xem chi tiết từng câu trả lời & điểm số</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>

          {/* Recent Submissions Feed */}
          <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-slate-900">
                  Lượt nộp bài gần đây
                </h2>
                <p className="text-xs text-slate-500">Các bài thi học sinh vừa hoàn thành trên hệ thống</p>
              </div>
              <Link
                href="/admin/attempts"
                className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentAttempts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Chưa có lượt nộp bài nào được ghi nhận.
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400">
                      <th className="pb-3 font-semibold">Học sinh</th>
                      <th className="pb-3 font-semibold">Đề thi</th>
                      <th className="pb-3 font-semibold text-center">Trạng thái</th>
                      <th className="pb-3 font-semibold text-center">Điểm số</th>
                      <th className="pb-3 font-semibold text-center">Thời gian làm</th>
                      <th className="pb-3 font-semibold text-right">Nộp lúc</th>
                      <th className="pb-3 font-semibold text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentAttempts.map((att) => {
                      const isGraded = att.status === "graded";
                      const pct =
                        att.score !== null && att.maxScore
                          ? Math.round((att.score / att.maxScore) * 100)
                          : 0;

                      return (
                        <tr key={att.id} className="hover:bg-slate-50/80">
                          <td className="py-3.5">
                            <div>
                              <p className="font-bold text-slate-900">{att.studentName}</p>
                              <p className="text-[11px] text-slate-400">
                                {att.studentGrade ? `Lớp ${att.studentGrade} • ` : ""}
                                {att.studentPhone}
                              </p>
                            </div>
                          </td>
                          <td className="py-3.5 max-w-[200px] truncate">
                            <p className="font-semibold text-slate-800 truncate">{att.examTitle}</p>
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                              {att.competition}
                            </span>
                          </td>
                          <td className="py-3.5 text-center">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                                isGraded
                                  ? "bg-emerald-100 text-emerald-800"
                                  : att.status === "in_progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {isGraded ? "Đã chấm" : att.status === "in_progress" ? "Đang thi" : att.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-center font-heading font-black text-sm text-slate-900">
                            {isGraded ? (
                              <span className={pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-blue-600" : "text-amber-600"}>
                                {att.score}/{att.maxScore} <span className="text-[10px] font-semibold text-slate-400">({pct}%)</span>
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3.5 text-center text-slate-600">
                            {formatDuration(att.durationSeconds)}
                          </td>
                          <td className="py-3.5 text-right text-slate-500 font-mono text-[11px]">
                            {formatTime(att.submittedAt || att.startedAt)}
                          </td>
                          <td className="py-3.5 text-right">
                            <Link
                              href={`/admin/attempts/${att.id}`}
                              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50"
                            >
                              Xem bài
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
