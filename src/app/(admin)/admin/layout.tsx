import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getAuthenticatedProfile } from "@/lib/api/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getAuthenticatedProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin") {
    redirect("/student/exams");
  }

  const supabase = await createSupabaseServerClient();
  const { data: fullProfile } = await supabase
    .from("profiles")
    .select("user_id, phone_number, display_name, role")
    .eq("user_id", profile.userId)
    .single();

  const user = {
    id: profile.userId,
    displayName: fullProfile?.display_name || profile.displayName || "Admin",
    phoneNumber: fullProfile?.phone_number || "",
    role: "admin",
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100/70">
      <AdminNav user={user} />
      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
}
