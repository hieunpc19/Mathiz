import {
  jsonResponse,
  loginErrorResponse,
  userResponse,
} from "@/lib/auth/responses";
import { phoneNumberToAuthEmail } from "@/lib/auth/identifier";
import { validateLoginInput } from "@/lib/auth/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      {
        error: { code: "INVALID_JSON", message: "Nội dung JSON không hợp lệ." },
      },
      400,
    );
  }

  const input = validateLoginInput(body);

  if (!input.success) {
    return jsonResponse(
      { error: { code: "VALIDATION_ERROR", message: input.message } },
      422,
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    const authEmail = phoneNumberToAuthEmail(input.data.phone_number);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: input.data.password,
    });

    if (error) {
      return loginErrorResponse(error);
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, phone_number, display_name, role, grade")
      .eq("user_id", data.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      return jsonResponse(
        {
          error: {
            code: "PROFILE_NOT_FOUND",
            message: "Tài khoản chưa có hồ sơ hợp lệ.",
          },
        },
        403,
      );
    }

    return jsonResponse({
      data: {
        user: userResponse(profile),
        sessionEstablished: true,
      },
    });
  } catch (error) {
    console.error("Login API configuration error", error);
    return jsonResponse(
      {
        error: {
          code: "AUTH_NOT_CONFIGURED",
          message: "Dịch vụ xác thực chưa được cấu hình đầy đủ.",
        },
      },
      503,
    );
  }
}
