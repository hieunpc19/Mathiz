"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  FilePlus2,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Trophy,
  Users,
  X,
} from "lucide-react";

interface AdminNavProps {
  user: {
    id: string;
    displayName: string;
    phoneNumber: string;
    role: string;
  };
}

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    {
      href: "/admin",
      label: "Tổng quan",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/admin/exams",
      label: "Quản lý đề thi",
      icon: BookOpen,
      exact: false,
    },
    {
      href: "/admin/exams/import",
      label: "Import đề thi",
      icon: FilePlus2,
      exact: true,
    },
    {
      href: "/admin/students",
      label: "Học sinh",
      icon: Users,
      exact: false,
    },
    {
      href: "/admin/attempts",
      label: "Lượt làm bài",
      icon: History,
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
    }
  }

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 font-heading text-lg font-black text-white shadow-sm">
                M
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-base font-extrabold tracking-tight text-slate-900">
                    Mathiz
                  </span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-700">
                    ADMIN
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Quản trị Khảo thí Olympic</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* View Student Portal Button */}
            <Link
              href="/student/exams"
              className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 sm:inline-flex"
            >
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              <span>Xem giao diện học sinh</span>
            </Link>

            {/* Profile Dropdown / Card */}
            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {user.displayName.slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">{user.displayName}</p>
                <p className="text-[10px] text-slate-500">{user.phoneNumber}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                title="Đăng xuất"
                className="ml-1 rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Horizontal Navigation Bar */}
        <div className="hidden border-t border-slate-100 bg-slate-50/60 lg:block">
          <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-1.5 sm:px-6 lg:px-8">
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
                      : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex bg-slate-950/60 backdrop-blur-xs lg:hidden">
          <div className="relative flex w-4/5 max-w-xs flex-col bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-heading font-black text-white">
                  M
                </div>
                <span className="font-heading font-bold text-slate-900">Mathiz Admin</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex-1 space-y-1">
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

              <div className="pt-4 border-t border-slate-100 mt-4">
                <Link
                  href="/student/exams"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-2xl p-3 text-sm font-bold text-amber-700 bg-amber-50"
                >
                  <Trophy className="h-5 w-5 text-amber-600" />
                  <span>Xem giao diện học sinh</span>
                </Link>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 p-3 text-xs font-bold text-rose-700 hover:bg-rose-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
