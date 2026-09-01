import {
  registerErrorResponse,
  jsonResponse,
  userResponse,
} from "@/lib/auth/responses";
import { phoneNumberToAuthEmail } from "@/lib/auth/identifier";
import { validateRegisterInput } from "@/lib/auth/validation";
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

  const input = validateRegisterInput(body);

  if (!input.success) {
    return jsonResponse(
      { error: { code: "VALIDATION_ERROR", message: input.message } },
      422,
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    const authEmail = phoneNumberToAuthEmail(input.data.phone_number);
    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password: input.data.password,
      options: {
        data: {
          phone_number: input.data.phone_number,
          display_name: input.data.displayName,
          grade: input.data.grade,
        },
      },
    });

    if (error) {
      return registerErrorResponse(error);
    }

    if (!data.user) {
      return jsonResponse(
        {
          error: {
            code: "REGISTER_FAILED",
            message: "Không thể đăng ký tài khoản.",
          },
        },
        502,
      );
    }

    if (!data.session) {
      return jsonResponse(
        {
          data: {
            user: {
              id: data.user.id,
              phone_number: input.data.phone_number,
              displayName: input.data.displayName,
              role: "student",
              grade: input.data.grade,
            },
            sessionEstablished: false,
          },
          warning:
            "Supabase đang yêu cầu xác minh email. Hãy tắt Confirm email cho định danh nội bộ.",
        },
        201,
      );
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
            code: "PROFILE_NOT_READY",
            message:
              "Tài khoản đã được tạo nhưng hồ sơ chưa sẵn sàng. Hãy kiểm tra migration 0002.",
          },
        },
        500,
      );
    }

    return jsonResponse(
      {
        data: {
          user: userResponse(profile),
          sessionEstablished: true,
        },
      },
      201,
    );
  } catch (error) {
    console.error("Register API configuration error", error);
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
