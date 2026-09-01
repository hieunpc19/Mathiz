"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  History,
  LoaderCircle,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

interface StudentProfile {
  userId: string;
  displayName: string;
  phoneNumber: string;
  grade: number | null;
  createdAt: string;
  attemptsCount: number;
  completedCount: number;
  averageScore: number | null;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");

  async function handleRefresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/students", { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error?.message || "Không thể tải danh sách học sinh.");
      setStudents(payload.data.students || []);
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
        const res = await fetch("/api/admin/students", { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error?.message || "Không thể tải danh sách học sinh.");
        if (!ignore) {
          setStudents(payload.data.students || []);
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
  }, []);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        !searchQuery.trim() ||
        s.displayName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        s.phoneNumber.includes(searchQuery.trim());

      const matchGrade = gradeFilter === "all" || s.grade?.toString() === gradeFilter;

      return matchSearch && matchGrade;
    });
  }, [students, searchQuery, gradeFilter]);

  function formatDate(iso: string) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-black text-slate-900 sm:text-3xl">
            Danh sách Học sinh
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Quản lý hồ sơ học sinh, khối lớp và theo dõi tiến độ luyện thi toán Olympic.
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
              placeholder="Tìm theo tên học sinh hoặc số điện thoại..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* Grade Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Khối lớp:</span>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả khối ({students.length})</option>
              {[1, 2, 3, 4, 5].map((g) => (
                <option key={g} value={g.toString()}>
                  Khối {g}
                </option>
              ))}
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
          <span className="ml-3 text-sm font-semibold">Đang tải danh sách học sinh...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 font-heading text-base font-bold text-slate-800">
            Không tìm thấy học sinh phù hợp
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Chưa có tài khoản học sinh nào đăng ký với điều kiện lọc này.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-400">
                  <th className="py-3.5 px-6 font-semibold">Học sinh</th>
                  <th className="py-3.5 px-4 font-semibold">Số điện thoại</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Khối lớp</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Lượt làm bài</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Điểm TB</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Ngày đăng ký</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.userId} className="hover:bg-slate-50/80">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 font-heading font-black text-white text-xs shadow-xs">
                          {s.displayName.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{s.displayName}</p>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {s.userId.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono font-medium text-slate-700">
                      {s.phoneNumber}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {s.grade ? (
                        <span className="rounded-xl bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                          Khối {s.grade}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-slate-900">
                      <span>{s.attemptsCount}</span>
                      <span className="text-[10px] font-normal text-slate-400 block">
                        ({s.completedCount} đã nộp)
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-heading font-black text-sm">
                      {s.averageScore !== null ? (
                        <span className={s.averageScore >= 80 ? "text-emerald-600" : s.averageScore >= 50 ? "text-blue-600" : "text-amber-600"}>
                          {s.averageScore}%
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal text-xs">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-slate-500 font-mono text-[11px]">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/attempts?studentId=${s.userId}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-blue-600 shadow-xs hover:bg-blue-50"
                      >
                        <History className="h-3.5 w-3.5" />
                        <span>Xem bài làm</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
