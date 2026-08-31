import Link from "next/link";
import type { ReactNode } from "react";
import { Navigation } from "@/components/navigation";

type AppShellProps = {
  area: string;
  children: ReactNode;
  navigationItems: readonly { href: string; label: string }[];
};

export function AppShell({ area, children, navigationItems }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-4 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-baseline gap-3">
            <Link
              href="/"
              className="text-xl font-bold text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Mathiz
            </Link>
            <span className="text-sm text-slate-500">{area}</span>
          </div>
          <Navigation items={navigationItems} />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
        {children}
      </main>
    </div>
  );
}
