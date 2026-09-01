"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  LogOut,
  Menu,
  Shield,
  Trophy,
  User,
  X,
} from "lucide-react";

interface StudentNavProps {
  user: {
    id: string;
    displayName: string;
    phoneNumber: string;
    role: string;
    grade?: number | null;
  };
}

export function StudentNav({ user }: StudentNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // During active exam or practice mode, do not show student navigation header
  const isExamMode =
    pathname.startsWith("/student/attempts/") ||
    pathname.startsWith("/student/practice/");

  if (isExamMode) {
    return null;
  }

  const navItems = [
    {
      href: "/student/exams",
      label: "Đề thi Olympic",
      icon: Trophy,
      exact: false,
    },
    {
      href: "/student/profile",
      label: "Hồ sơ của bé",
      icon: User,
      exact: false,
    },
  ];

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

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const gradeLabel = user.grade ? `Lớp ${user.grade}` : "Học sinh";

  return (
    <>
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Left: Brand & Mobile Trigger */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer"
              aria-label="Mở menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/student/exams" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 font-heading text-xl font-black text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
                M
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition">
                    Mathiz
                  </span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-700">
                    OLYMPIC
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                  Đấu trường Toán học Tiểu học
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-4">
              {navItems.map((item) => {
                const active = isActive(item.href, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                      active
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Quick Actions & Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* If user is admin, provide link to Admin portal */}
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="hidden items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 sm:inline-flex"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Trang Quản trị</span>
              </Link>
            )}

            {/* Profile Dropdown Trigger */}
            <div className="relative">
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 px-2.5 py-1.5 transition cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-tr from-amber-400 to-amber-500 text-slate-900 text-xs font-black shadow-xs">
                  {user.displayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="hidden text-left sm:block">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 leading-tight max-w-[130px] truncate">
                      {user.displayName}
                    </p>
                    <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-black text-emerald-800">
                      {gradeLabel}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">{user.phoneNumber}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
              </div>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-40 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user.displayName}
                      </p>
                      <p className="text-[11px] text-slate-500">{user.phoneNumber}</p>
                      <span className="mt-1.5 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        {gradeLabel}
                      </span>
                    </div>

                    <Link
                      href="/student/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                    >
                      <User className="h-4 w-4 text-blue-600" />
                      <span>Hồ sơ của bé</span>
                    </Link>

                    <Link
                      href="/student/exams"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                    >
                      <BookOpen className="h-4 w-4 text-amber-600" />
                      <span>Danh sách đề thi</span>
                    </Link>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          setShowLogoutModal(true);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 text-rose-500" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Direct Logout Button */}
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
              title="Đăng xuất khỏi tài khoản"
            >
              <LogOut className="h-3.5 w-3.5 text-rose-600" />
              <span className="hidden md:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex bg-slate-950/60 backdrop-blur-xs lg:hidden">
          <div className="relative flex w-4/5 max-w-xs flex-col bg-white p-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 font-heading font-black text-white">
                  M
                </div>
                <span className="font-heading font-bold text-slate-900">Mathiz Olympic</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User info card */}
            <div className="mt-4 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 p-3.5 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 font-heading text-base font-black text-slate-900">
                  {user.displayName.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{user.displayName}</p>
                  <p className="text-[11px] text-slate-500">{user.phoneNumber}</p>
                  <span className="mt-1 inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                    {gradeLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="mt-4 flex-1 space-y-1.5">
              {navItems.map((item) => {
                const active = isActive(item.href, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl p-3 text-sm font-bold transition ${
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {user.role === "admin" && (
                <div className="pt-3 border-t border-slate-100 mt-3">
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-2xl p-3 text-sm font-bold text-indigo-700 bg-indigo-50"
                  >
                    <Shield className="h-5 w-5 text-indigo-600" />
                    <span>Trang Quản trị</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Logout button */}
            <div className="border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setShowLogoutModal(true);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 p-3 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
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
    </>
  );
}
