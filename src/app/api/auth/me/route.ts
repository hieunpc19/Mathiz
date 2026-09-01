import { jsonResponse } from "@/lib/auth/responses";
import { getAuthenticatedProfile } from "@/lib/api/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const profile = await getAuthenticatedProfile();
  if (!profile) {
    return jsonResponse(
      { error: { code: "UNAUTHORIZED", message: "Chưa đăng nhập." } },
      401,
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: fullProfile } = await supabase
    .from("profiles")
    .select("user_id, phone_number, display_name, role, grade, created_at")
    .eq("user_id", profile.userId)
    .single();

  return jsonResponse({
    data: {
      user: {
        id: profile.userId,
        phone_number: fullProfile?.phone_number ?? "",
        displayName: profile.displayName,
        role: profile.role,
        grade: profile.grade,
        createdAt: fullProfile?.created_at,
      },
    },
  });
}
