import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getAuthenticatedProfile } from "@/lib/api/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StudentNav } from "@/components/student/student-nav";

export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getAuthenticatedProfile();

  if (!profile) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  const { data: fullProfile } = await supabase
    .from("profiles")
    .select("user_id, phone_number, display_name, role, grade")
    .eq("user_id", profile.userId)
    .single();

  const user = {
    id: profile.userId,
    displayName: fullProfile?.display_name || profile.displayName || "Học sinh",
    phoneNumber: fullProfile?.phone_number || "",
    role: profile.role,
    grade: fullProfile?.grade ?? profile.grade ?? 2,
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <StudentNav user={user} />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
