"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Eye,
  History,
  LoaderCircle,
  RefreshCw,
  Search,
} from "lucide-react";

interface AdminAttempt {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  studentGrade: number | null;
  examId: string | null;
  examTitle: string;
  competition: string;
  versionNo: number;
  status: string;
  startedAt: string;
  deadlineAt: string | null;
  submittedAt: string | null;
  score: number | null;
  maxScore: number | null;
  durationSeconds: number | null;
  submitReason: string | null;
}

export default function AdminAttemptsPage() {
  const searchParams = useSearchParams();
  const initialStudentId = searchParams.get("studentId") || "";

  const [attempts, setAttempts] = useState<AdminAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId);

  async function handleRefresh() {
    setLoading(true);
    setError(null);
    try {
      let url = "/api/admin/attempts";
      const params = new URLSearchParams();
      if (selectedStudentId) params.set("studentId", selectedStudentId);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error?.message || "Không thể tải danh sách bài làm.");
      setAttempts(payload.data.attempts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        let url = "/api/admin/attempts";
        const params = new URLSearchParams();
        if (selectedStudentId) params.set("studentId", selectedStudentId);
        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url, { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error?.message || "Không thể tải danh sách bài làm.");
        if (!ignore) {
          setAttempts(payload.data.attempts || []);
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
  }, [selectedStudentId]);

  const filtered = useMemo(() => {
    return attempts.filter((a) => {
      const matchSearch =
        !searchQuery.trim() ||
        a.studentName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        a.studentPhone.includes(searchQuery.trim()) ||
        a.examTitle.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        a.competition.toLowerCase().includes(searchQuery.toLowerCase().trim());

      const matchStatus = statusFilter === "all" || a.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [attempts, searchQuery, statusFilter]);

  function formatTime(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-black text-slate-900 sm:text-3xl">
            Lịch sử & Lượt làm bài
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Giám sát toàn bộ lượt thi, trạng thái nộp bài, thời gian hoàn thành và kết quả chấm điểm.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleRefresh()}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {selectedStudentId && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-blue-50 p-3 text-xs font-bold text-blue-700">
          <span>Đang lọc theo học sinh ID: {selectedStudentId}</span>
          <button
            type="button"
            onClick={() => setSelectedStudentId("")}
            className="ml-auto rounded-lg bg-white px-2 py-1 text-slate-700 hover:bg-slate-100"
          >
            Bỏ lọc học sinh
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên học sinh, số điện thoại hoặc tên đề..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả ({attempts.length})</option>
              <option value="graded">Đã chấm điểm</option>
              <option value="in_progress">Đang làm bài</option>
              <option value="abandoned">Đã bỏ dở</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-sm font-semibold">Đang tải lịch sử làm bài...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <History className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 font-heading text-base font-bold text-slate-800">
            Không tìm thấy lượt làm bài phù hợp
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Chưa có lượt thi nào được ghi nhận với điều kiện tìm kiếm hiện tại.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-400">
                  <th className="py-3.5 px-6 font-semibold">Học sinh</th>
                  <th className="py-3.5 px-4 font-semibold">Đề thi</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Điểm số</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Thời gian làm</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Lý do nộp</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Nộp lúc</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((att) => {
                  const isGraded = att.status === "graded";
                  const pct =
                    att.score !== null && att.maxScore
                      ? Math.round((att.score / att.maxScore) * 100)
                      : 0;

                  return (
                    <tr key={att.id} className="hover:bg-slate-50/80">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-slate-900">{att.studentName}</p>
                          <p className="text-[11px] text-slate-400">
                            {att.studentGrade ? `Lớp ${att.studentGrade} • ` : ""}
                            {att.studentPhone}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 max-w-[220px]">
                        <p className="font-semibold text-slate-800 truncate">{att.examTitle}</p>
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                          {att.competition}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                            isGraded
                              ? "bg-emerald-100 text-emerald-800"
                              : att.status === "in_progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {isGraded ? "Đã chấm điểm" : att.status === "in_progress" ? "Đang thi" : att.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-heading font-black text-sm text-slate-900">
                        {isGraded ? (
                          <span className={pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-blue-600" : "text-amber-600"}>
                            {att.score}/{att.maxScore} <span className="text-[10px] font-semibold text-slate-400">({pct}%)</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal text-xs">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center text-slate-600 font-medium">
                        {formatDuration(att.durationSeconds)}
                      </td>
                      <td className="py-4 px-4 text-center text-slate-500">
                        {att.submitReason === "manual"
                          ? "Học sinh bấm nộp"
                          : att.submitReason === "timeout"
                            ? "Hết giờ làm bài"
                            : att.submitReason || "—"}
                      </td>
                      <td className="py-4 px-4 text-right text-slate-500 font-mono text-[11px]">
                        {formatTime(att.submittedAt || att.startedAt)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/admin/attempts/${att.id}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-blue-600 shadow-xs hover:bg-blue-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Chi tiết</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
