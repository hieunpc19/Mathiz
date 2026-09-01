"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit3,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  Lock,
  LogOut,
  Phone,
  Play,
  Save,
  Shield,
  Sparkles,
  TrendingUp,
  Trophy,
  User,
} from "lucide-react";

interface StudentProfile {
  userId: string;
  phoneNumber: string;
  displayName: string;
  role: string;
  grade: number | null;
  createdAt: string;
}

interface StudentStats {
  totalAttempts: number;
  completedAttempts: number;
  averageScorePercent: number;
  highestScore: {
    score: number;
    maxScore: number;
    percent: number;
    examTitle: string;
  } | null;
  totalTimeSpentSeconds: number;
}

interface RecentAttempt {
  id: string;
  examId: string;
  examTitle: string;
  examSubtitle: string;
  competition: string;
  gradeLabel: string;
  status: string;
  score: number | null;
  maxScore: number | null;
  percent: number | null;
  durationSeconds: number | null;
  startedAt: string;
  submittedAt: string | null;
}

const AVATAR_OPTIONS = [
  { id: "lion", emoji: "🦁", label: "Sư Tử Dũng Mãnh" },
  { id: "owl", emoji: "🦉", label: "Cú Mèo Thông Thái" },
  { id: "rocket", emoji: "🚀", label: "Phi Hành Gia" },
  { id: "bolt", emoji: "⚡", label: "Tia Chớp Tính Nhanh" },
  { id: "crown", emoji: "👑", label: "Vua Giải Đố" },
  { id: "unicorn", emoji: "🦄", label: "Kỳ Lân Sáng Tạo" },
  { id: "star", emoji: "🌟", label: "Ngôi Sao Olympic" },
  { id: "target", emoji: "🎯", label: "Thiện Xạ Toán Học" },
];

function subscribeToAvatar(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("mathiz_avatar_change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("mathiz_avatar_change", callback);
  };
}

function getAvatarSnapshot() {
  try {
    return localStorage.getItem("mathiz_student_avatar") || "lion";
  } catch {
    return "lion";
  }
}

function getServerAvatarSnapshot() {
  return "lion";
}

export default function StudentProfilePage() {
  const router = useRouter();

  // Data states
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<RecentAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState<"history" | "edit" | "security">("history");

  // Selected avatar
  const selectedAvatar = useSyncExternalStore(
    subscribeToAvatar,
    getAvatarSnapshot,
    getServerAvatarSnapshot,
  );

  // Edit form states
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editGrade, setEditGrade] = useState<number>(2);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Logout state
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  function handleSelectAvatar(avatarId: string) {
    try {
      localStorage.setItem("mathiz_student_avatar", avatarId);
      window.dispatchEvent(new Event("mathiz_avatar_change"));
    } catch {
      // Ignore
    }
  }

  // Fetch profile and stats
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/student/profile", { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload.error?.message ?? "Không thể tải thông tin hồ sơ.");
        }
        const data = payload.data;
        setProfile(data.profile);
        setStats(data.stats);
        setRecentAttempts(data.recentAttempts ?? []);

        setEditDisplayName(data.profile.displayName);
        setEditGrade(data.profile.grade ?? 2);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không thể tải hồ sơ.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Handle Edit Submit
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);

    if (!editDisplayName.trim()) {
      setSaveError("Vui lòng nhập tên của bé.");
      return;
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        setSaveError("Mật khẩu mới phải có ít nhất 8 ký tự.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setSaveError("Mật khẩu xác nhận không khớp.");
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: editDisplayName.trim(),
          grade: editGrade,
          newPassword: newPassword || undefined,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error?.message ?? "Không thể lưu thông tin.");
      }

      setSaveSuccess("Đã lưu thông tin hồ sơ thành công!");
      if (payload.data?.profile) {
        setProfile((prev) => (prev ? { ...prev, ...payload.data.profile } : null));
      }
      setNewPassword("");
      setConfirmPassword("");
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "Không thể lưu thông tin.");
    } finally {
      setSaving(false);
    }
  }

  // Handle Logout
  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  }

  // Helper formatting
  const currentAvatar =
    AVATAR_OPTIONS.find((a) => a.id === selectedAvatar) || AVATAR_OPTIONS[0];

  function formatTimeMinutes(seconds: number) {
    if (!seconds) return "0 phút";
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} phút`;
    const hours = (mins / 60).toFixed(1);
    return `${hours} giờ`;
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  // Calculate Rank Title
  function getRankTitle(completedCount: number) {
    if (completedCount >= 20) return { title: "Đại Kiện Tướng Olympic", color: "text-amber-300", badge: "💎 Kim Cương" };
    if (completedCount >= 10) return { title: "Kiện Tướng Olympic", color: "text-amber-200", badge: "🥇 Vàng" };
    if (completedCount >= 5) return { title: "Chiến Binh Toán Học", color: "text-blue-200", badge: "🥈 Bạc" };
    if (completedCount >= 1) return { title: "Tập Sự Olympic", color: "text-emerald-200", badge: "🥉 Đồng" };
    return { title: "Tân Binh Mathiz", color: "text-slate-200", badge: "🌱 Tân Binh" };
  }

  const rank = getRankTitle(stats?.completedAttempts ?? 0);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-slate-500 font-medium">
        <LoaderCircle className="h-6 w-6 animate-spin text-blue-600" />
        <span>Đang tải thông tin hồ sơ của bé...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-700">
          {error ?? "Không tìm thấy hồ sơ người dùng. Vui lòng đăng nhập lại."}
        </p>
        <button
          onClick={() => router.push("/login")}
          className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer"
        >
          Đến trang đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* 1. HERO PROFILE HEADER */}
      <section className="relative overflow-hidden border-b border-blue-200/60 bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-md">
        {/* Glow & Backdrop Orbs */}
        <div className="pointer-events-none absolute -top-16 right-10 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-10 h-64 w-64 rounded-full bg-blue-400/20 blur-2xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Left: Avatar & Basic Info */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Large Avatar */}
              <div className="relative group">
                <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-linear-to-br from-amber-300 via-amber-400 to-amber-500 text-4xl sm:text-5xl shadow-xl ring-4 ring-white/25 transition">
                  {currentAvatar.emoji}
                </div>
                <div className="absolute -bottom-2 -right-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-black text-white shadow-md border-2 border-white">
                  {rank.badge}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-xl bg-white/15 px-3 py-1 text-xs font-extrabold text-blue-100 backdrop-blur-md">
                    {profile.grade ? `Lớp ${profile.grade}` : "Học sinh"}
                  </span>
                  <span className="rounded-xl bg-amber-400 px-3 py-1 text-xs font-black text-slate-950">
                    {rank.title}
                  </span>
                </div>

                <h1 className="mt-2 font-heading text-2xl font-extrabold sm:text-3xl text-white">
                  {profile.displayName}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-blue-100">
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-blue-200" />
                    {profile.phoneNumber}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-200" />
                    Tham gia: {formatDate(profile.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action CTAs */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("edit")}
                className="tactile-btn tactile-btn-white flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md border border-white/20 transition cursor-pointer"
              >
                <Edit3 className="h-4 w-4" />
                <span>Đổi thông tin</span>
              </button>

              <button
                onClick={() => setShowLogoutModal(true)}
                className="tactile-btn flex items-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 px-4 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTAINER */}
      <main className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        {/* 2.1. QUICK METRICS 4-CARD DASHBOARD */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {/* Card 1: Completed Exams */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-400">Đã hoàn thành</span>
            </div>
            <strong className="mt-3 block font-heading text-2xl font-black text-slate-900 sm:text-3xl">
              {stats?.completedAttempts ?? 0}
            </strong>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Đề thi Olympic</p>
          </div>

          {/* Card 2: Average Score */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-400">Tỷ lệ chính xác</span>
            </div>
            <strong className="mt-3 block font-heading text-2xl font-black text-slate-900 sm:text-3xl">
              {stats?.averageScorePercent ?? 0}%
            </strong>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Điểm trung bình</p>
          </div>

          {/* Card 3: Best Score */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <Trophy className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-400">Điểm kỷ lục</span>
            </div>
            <strong className="mt-3 block font-heading text-2xl font-black text-slate-900 sm:text-3xl">
              {stats?.highestScore ? `${stats.highestScore.percent}%` : "—"}
            </strong>
            <p className="mt-0.5 text-xs font-medium text-slate-500 truncate" title={stats?.highestScore?.examTitle}>
              {stats?.highestScore ? stats.highestScore.examTitle : "Chưa làm bài"}
            </p>
          </div>

          {/* Card 4: Total Study Time */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-400">Rèn luyện</span>
            </div>
            <strong className="mt-3 block font-heading text-2xl font-black text-slate-900 sm:text-3xl">
              {formatTimeMinutes(stats?.totalTimeSpentSeconds ?? 0)}
            </strong>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Tổng thời gian</p>
          </div>
        </div>

        {/* 2.2. OLYMPIC MEDALS & BADGES */}
        <div className="mt-6 rounded-3xl border border-amber-200 bg-linear-to-r from-amber-50 via-yellow-50 to-amber-50/60 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-600" />
              <h2 className="font-heading text-base font-extrabold text-slate-900">
                Huy hiệu Đấu trường Olympic
              </h2>
            </div>
            <span className="text-xs font-bold text-amber-700">
              Đã mở khóa {(stats?.completedAttempts ?? 0) >= 1 ? "được vinh danh" : "luyện tập để mở khóa"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Badge 1: First Attempt */}
            <div
              className={`flex items-center gap-3 rounded-2xl p-3 border transition ${
                (stats?.completedAttempts ?? 0) >= 1
                  ? "bg-white border-amber-300 shadow-xs"
                  : "bg-slate-100/70 border-slate-200 opacity-60"
              }`}
            >
              <span className="text-3xl">🥉</span>
              <div>
                <p className="text-xs font-bold text-slate-900">Tân Binh Toán Học</p>
                <p className="text-[10px] text-slate-500">Hoàn thành 1 bài thi</p>
              </div>
            </div>

            {/* Badge 2: High Score */}
            <div
              className={`flex items-center gap-3 rounded-2xl p-3 border transition ${
                stats?.highestScore && stats.highestScore.percent >= 80
                  ? "bg-white border-amber-300 shadow-xs"
                  : "bg-slate-100/70 border-slate-200 opacity-60"
              }`}
            >
              <span className="text-3xl">🎯</span>
              <div>
                <p className="text-xs font-bold text-slate-900">Tay Cung Cự Phách</p>
                <p className="text-[10px] text-slate-500">Đạt điểm từ 80% trở lên</p>
              </div>
            </div>

            {/* Badge 3: 5 Exams */}
            <div
              className={`flex items-center gap-3 rounded-2xl p-3 border transition ${
                (stats?.completedAttempts ?? 0) >= 5
                  ? "bg-white border-amber-300 shadow-xs"
                  : "bg-slate-100/70 border-slate-200 opacity-60"
              }`}
            >
              <span className="text-3xl">⚡</span>
              <div>
                <p className="text-xs font-bold text-slate-900">Chiến Binh Bền Bỉ</p>
                <p className="text-[10px] text-slate-500">Hoàn thành 5 bài thi</p>
              </div>
            </div>

            {/* Badge 4: Perfect 100% */}
            <div
              className={`flex items-center gap-3 rounded-2xl p-3 border transition ${
                stats?.highestScore && stats.highestScore.percent === 100
                  ? "bg-white border-amber-300 shadow-xs"
                  : "bg-slate-100/70 border-slate-200 opacity-60"
              }`}
            >
              <span className="text-3xl">👑</span>
              <div>
                <p className="text-xs font-bold text-slate-900">Thủ Khoa Olympic</p>
                <p className="text-[10px] text-slate-500">Đạt điểm tuyệt đối 100%</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2.3. NAVIGATION TABS */}
        <div className="mt-8 flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition cursor-pointer ${
              activeTab === "history"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Lịch sử làm bài ({recentAttempts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("edit")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition cursor-pointer ${
              activeTab === "edit"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Edit3 className="h-4 w-4" />
            <span>Chỉnh sửa thông tin</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition cursor-pointer ${
              activeTab === "security"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Tài khoản & Đăng xuất</span>
          </button>
        </div>

        {/* 2.4. TAB CONTENT */}
        <div className="mt-6">
          {/* TAB 1: EXAM HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-4">
              {recentAttempts.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 mx-auto text-2xl">
                    📚
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-bold text-slate-900">
                    Bé chưa làm bài thi nào
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                    Hãy bắt đầu trải nghiệm các đề thi Olympic toán thú vị ngay hôm nay để tích lũy điểm và huy hiệu!
                  </p>
                  <Link
                    href="/student/exams"
                    className="tactile-btn tactile-btn-blue mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>Khám phá danh sách đề thi</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAttempts.map((attempt) => {
                    const isSubmitted =
                      attempt.status === "submitted" || attempt.status === "graded";
                    const isPassed =
                      attempt.percent !== null && attempt.percent >= 60;

                    return (
                      <div
                        key={attempt.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md"
                      >
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-black text-sm ${
                              isSubmitted
                                ? isPassed
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {isSubmitted ? `${attempt.percent}%` : "—"}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-lg bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-700">
                                {attempt.gradeLabel || "Lớp 2"}
                              </span>
                              <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">
                                {attempt.competition}
                              </span>
                              {isSubmitted ? (
                                <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  Đã chấm điểm
                                </span>
                              ) : (
                                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                  Chưa nộp
                                </span>
                              )}
                            </div>

                            <h3 className="mt-1.5 font-heading text-base font-bold text-slate-900">
                              {attempt.examTitle}
                            </h3>

                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                {formatDate(attempt.startedAt)}
                              </span>
                              {attempt.durationSeconds && (
                                <span>
                                  Thời gian làm: {formatTimeMinutes(attempt.durationSeconds)}
                                </span>
                              )}
                              {attempt.score !== null && attempt.maxScore !== null && (
                                <strong className="text-slate-700">
                                  Điểm số: {attempt.score}/{attempt.maxScore}
                                </strong>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {isSubmitted ? (
                            <Link
                              href={`/student/results/${attempt.id}`}
                              className="tactile-btn flex items-center gap-1.5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                            >
                              <span>Xem lời giải chi tiết</span>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          ) : (
                            <Link
                              href={`/student/attempts/${attempt.id}`}
                              className="tactile-btn flex items-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                            >
                              <span>Tiếp tục làm bài</span>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EDIT PROFILE */}
          {activeTab === "edit" && (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-extrabold text-slate-900">
                Thông tin tài khoản học sinh
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Cập nhật tên bé, khối lớp đang học và hình đại diện yêu thích.
              </p>

              {/* Avatar Selector */}
              <div className="mt-6 border-b border-slate-100 pb-6">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Chọn Linh Vật Đồng Hành
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                  {AVATAR_OPTIONS.map((avatar) => {
                    const isSelected = avatar.id === selectedAvatar;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => handleSelectAvatar(avatar.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition cursor-pointer ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/80 scale-105 shadow-sm"
                            : "border-slate-200 bg-slate-50 hover:bg-slate-100/60"
                        }`}
                        title={avatar.label}
                      >
                        <span className="text-3xl">{avatar.emoji}</span>
                        <span className="mt-1 text-[10px] font-bold text-slate-700 truncate w-full text-center">
                          {avatar.label.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {saveSuccess && (
                <div className="mt-6 flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>{saveSuccess}</span>
                </div>
              )}

              {saveError && (
                <div className="mt-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-700">
                  {saveError}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="mt-6 space-y-6">
                {/* Display Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Tên của bé / Tên hiển thị <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Minh An"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition"
                      required
                    />
                  </div>
                </div>

                {/* Grade Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Khối Lớp Hiện Tại <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                    {[1, 2, 3, 4, 5].map((g) => {
                      const isSelected = editGrade === g;
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setEditGrade(g)}
                          className={`tactile-btn py-3 px-4 rounded-2xl text-xs font-black border-2 transition cursor-pointer ${
                            isSelected
                              ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          Lớp {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Phone Number (Read-only) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Số điện thoại đăng nhập (Tài khoản)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={profile.phoneNumber}
                      disabled
                      className="w-full rounded-2xl border border-slate-200 bg-slate-100 py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Số điện thoại là mã định danh duy nhất của tài khoản Mathiz.
                  </p>
                </div>

                {/* Change Password Section */}
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="font-heading text-sm font-bold text-slate-900 flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-blue-600" />
                    <span>Đổi mật khẩu tài khoản (Để trống nếu không đổi)</span>
                  </h3>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Mật khẩu mới
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Tối thiểu 8 ký tự"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-xs font-medium outline-none focus:border-blue-500 focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Xác nhận mật khẩu mới
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Nhập lại mật khẩu mới"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="tactile-btn tactile-btn-blue flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition cursor-pointer disabled:opacity-60"
                  >
                    {saving ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{saving ? "Đang lưu thay đổi..." : "Lưu thông tin hồ sơ"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: ACCOUNT & LOGOUT */}
          {activeTab === "security" && (
            <div className="space-y-6">
              {/* Account details card */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
                <h2 className="font-heading text-lg font-extrabold text-slate-900">
                  Thông tin phiên đăng nhập
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <span className="text-slate-400 font-medium">Số điện thoại liên kết:</span>
                    <strong className="block mt-1 text-sm text-slate-800">{profile.phoneNumber}</strong>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <span className="text-slate-400 font-medium">Vai trò tài khoản:</span>
                    <strong className="block mt-1 text-sm text-emerald-700 capitalize">
                      {profile.role === "admin" ? "Quản trị viên & Học sinh" : "Học sinh Olympic"}
                    </strong>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <span className="text-slate-400 font-medium">Ngày tạo tài khoản:</span>
                    <strong className="block mt-1 text-sm text-slate-800">{formatDate(profile.createdAt)}</strong>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <span className="text-slate-400 font-medium">Bảo mật:</span>
                    <strong className="block mt-1 text-sm text-blue-700">Mật khẩu mã hóa Supabase Auth</strong>
                  </div>
                </div>
              </div>

              {/* Danger Zone: Log Out */}
              <div className="rounded-3xl border-2 border-rose-200 bg-rose-50/50 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading text-base font-extrabold text-rose-900">
                      Đăng xuất khỏi thiết bị
                    </h3>
                    <p className="mt-1 text-xs text-rose-700 max-w-md leading-relaxed">
                      Đăng xuất sẽ kết thúc phiên làm việc hiện tại trên thiết bị này. Bé có thể đăng nhập lại bất kỳ lúc nào bằng số điện thoại và mật khẩu.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowLogoutModal(true)}
                    className="tactile-btn flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất tài khoản</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 3. LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mx-auto">
              <LogOut className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-center font-heading text-lg font-bold text-slate-900">
              Xác nhận đăng xuất?
            </h3>
            <p className="mt-2 text-center text-xs text-slate-500 leading-relaxed">
              Bé và phụ huynh có chắc chắn muốn đăng xuất khỏi tài khoản Mathiz không?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={loggingOut}
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-2xl border border-slate-200 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Ở lại luyện tiếp
              </button>
              <button
                type="button"
                disabled={loggingOut}
                onClick={handleLogout}
                className="flex-1 rounded-2xl bg-rose-600 py-3 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
              >
                {loggingOut ? "Đang đăng xuất..." : "Đăng xuất ngay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
