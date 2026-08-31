import { AppShell } from "@/components/app-shell";
import type { ReactNode } from "react";

const navigationItems = [
  { href: "/student/exams", label: "Đề thi" },
  { href: "/select-profile", label: "Đổi hồ sơ" },
] as const;

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell area="Học sinh" navigationItems={navigationItems}>
      {children}
    </AppShell>
  );
}
