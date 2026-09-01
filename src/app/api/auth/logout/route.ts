import { jsonResponse } from "@/lib/auth/responses";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    return jsonResponse({
      data: {
        success: true,
        message: "Đăng xuất thành công.",
      },
    });
  } catch (error) {
    console.error("Logout error", error);
    return jsonResponse(
      {
        error: {
          code: "LOGOUT_FAILED",
          message: "Không thể đăng xuất.",
        },
      },
      500,
    );
  }
}
