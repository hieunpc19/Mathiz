import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthenticatedProfile = {
  userId: string;
  role: "admin" | "student";
  displayName: string;
  grade: number | null;
};

export async function getAuthenticatedProfile(): Promise<
  AuthenticatedProfile | null
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, role, display_name, grade")
    .eq("user_id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "student")) {
    return null;
  }

  return {
    userId: profile.user_id,
    role: profile.role,
    displayName: profile.display_name,
    grade: profile.grade,
  };
}

export function apiError(code: string, message: string, status: number) {
  return Response.json({ error: { code, message } }, { status });
}

export async function requireProfile(role?: "admin" | "student") {
  const profile = await getAuthenticatedProfile();
  if (!profile) {
    return { response: apiError("UNAUTHORIZED", "Vui lòng đăng nhập.", 401) };
  }
  if (role && profile.role !== role) {
    return {
      response: apiError(
        "FORBIDDEN",
        "Bạn không có quyền thực hiện thao tác này.",
        403,
      ),
    };
  }
  return { profile };
}
