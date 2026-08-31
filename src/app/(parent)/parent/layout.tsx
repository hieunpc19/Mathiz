import { AppShell } from "@/components/app-shell";
import type { ReactNode } from "react";

const navigationItems = [
  { href: "/parent/dashboard", label: "Tổng quan" },
  { href: "/parent/exams", label: "Đề thi" },
  { href: "/parent/children", label: "Các bé" },
] as const;

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell area="Phụ huynh" navigationItems={navigationItems}>
      {children}
    </AppShell>
  );
}
