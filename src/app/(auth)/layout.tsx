import { AppShell } from "@/components/app-shell";

const navigationItems = [{ href: "/", label: "Trang chủ" }] as const;

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <AppShell area="Truy cập" navigationItems={navigationItems}>
      {children}
    </AppShell>
  );
}
