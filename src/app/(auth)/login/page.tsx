"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  LoaderCircle,
  Lock,
  Phone,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";

type AuthMode = "login" | "register";

function formatToE164(phone: string): string {
  let cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("0")) {
    cleaned = "+84" + cleaned.slice(1);
  } else if (cleaned.length >= 9 && !cleaned.startsWith("+")) {
    cleaned = "+84" + cleaned;
  }
  return cleaned;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as AuthMode) || "login";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [grade, setGrade] = useState<number>(2);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const e164Preview = phoneNumber.trim() ? formatToE164(phoneNumber.trim()) : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const formattedPhone = formatToE164(phoneNumber.trim());
    if (!formattedPhone || formattedPhone.length < 10) {
      setError("Vui lòng nhập số điện thoại.");
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone_number: formattedPhone,
            password,
          }),
        });
        const payload = await res.json();

        if (!res.ok) {
          throw new Error(payload.error?.message || "Đăng nhập không thành công.");
        }

        setSuccessMsg("Đăng nhập thành công! Đang chuyển hướng...");
        const role = payload.data?.user?.role;
        setTimeout(() => {
          if (role === "admin") {
            router.push("/admin");
          } else {
            router.push("/student/exams");
          }
          router.refresh();
        }, 500);
      } else {
        if (!displayName.trim()) {
          setError("Vui lòng nhập tên của bé.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone_number: formattedPhone,
            password,
            displayName: displayName.trim(),
            grade,
          }),
        });
        const payload = await res.json();

        if (!res.ok) {
          throw new Error(payload.error?.message || "Đăng ký không thành công.");
        }

        setSuccessMsg("Tạo tài khoản thành công! Đang chuyển đến phòng thi...");
        setTimeout(() => {
          router.push("/student/exams");
          router.refresh();
        }, 600);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 bg-linear-to-br from-blue-50 via-indigo-50/40 to-slate-100" />

      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border-2 border-slate-200/80 bg-white shadow-2xl lg:grid-cols-12">
        {/* Left Branding Side */}
        <div className="relative flex flex-col justify-between bg-linear-to-br from-blue-700 via-indigo-700 to-blue-900 p-8 text-white sm:p-10 lg:col-span-5">
          <div className="relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-100 backdrop-blur-md hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" /> Về trang chủ
            </Link>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 font-heading text-2xl font-black text-slate-950 shadow-md">
                M
              </div>
              <div>
                <span className="font-heading text-2xl font-black tracking-tight">Mathiz</span>
                <p className="text-xs font-semibold text-blue-200">Đấu trường Toán Olympic</p>
              </div>
            </div>

            <h1 className="mt-8 font-heading text-2xl font-extrabold sm:text-3xl">
              {mode === "login" ? "Chào mừng bạn trở lại!" : "Khởi đầu hành trình Toán Olympic"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-blue-100">
              Nền tảng luyện thi chuẩn đề Kangaroo (IKMC), TIMO, SASMO dành riêng cho học sinh Tiểu học
              với bảng nháp thông minh và chấm điểm tức thì.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur-xs">
                <Trophy className="h-5 w-5 text-amber-300 shrink-0" />
                <span className="text-xs font-medium text-blue-50">Bộ đề thi thật qua các năm có bản quyền</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur-xs">
                <Sparkles className="h-5 w-5 text-pink-300 shrink-0" />
                <span className="text-xs font-medium text-blue-50">Tối ưu mượt mà cho iPad & Laptop</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur-xs">
                <Award className="h-5 w-5 text-emerald-300 shrink-0" />
                <span className="text-xs font-medium text-blue-50">Huy chương & Lời giải chi tiết từng bước</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 border-t border-white/15 pt-4 text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Bảo mật phiên đăng nhập an toàn</span>
            </div>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-7">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-2xl bg-slate-100 p-1.5">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition ${mode === "login"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <KeyRound className="h-4 w-4" /> Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition ${mode === "register"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <GraduationCap className="h-4 w-4" /> Đăng ký học sinh
            </button>
          </div>

          {/* Form Header */}
          <div className="mt-6">
            <h2 className="font-heading text-xl font-extrabold text-slate-900">
              {mode === "login" ? "Đăng nhập tài khoản" : "Tạo tài khoản học sinh mới"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {mode === "login"
                ? "Dành cho Giáo viên quản trị và Học sinh luyện thi."
                : "Đăng ký nhanh chỉ với số điện thoại và khối lớp của bé."}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">
              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
              {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "register" && (
              <>
                {/* Display Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700">Họ và tên của bé *</label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Minh An"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Grade Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700">Khối lớp của bé *</label>
                  <div className="mt-1.5 grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGrade(g)}
                        className={`tactile-btn flex flex-col items-center justify-center rounded-2xl py-2.5 text-xs font-extrabold transition ${grade === g
                          ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2"
                          : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                          }`}
                      >
                        <span className="text-[10px] opacity-75">Khối</span>
                        <span className="text-base font-black">{g}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Phone Number */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">Số điện thoại *</label>
              </div>
              <div className="relative mt-1.5">
                <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ví dụ: 0901234567 hoặc +84901234567"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700">Mật khẩu *</label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 8 ký tự"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="tactile-btn mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-heading text-sm font-extrabold text-white shadow-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : mode === "login" ? (
                <>
                  <span>Đăng nhập ngay</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Hoàn tất đăng ký</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-slate-400">
          <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
