import type { AuthError } from "@supabase/supabase-js";

type Profile = {
  user_id: string;
  phone_number: string;
  display_name: string;
  role: "admin" | "student";
  grade: number | null;
};

export function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function userResponse(profile: Profile) {
  return {
    id: profile.user_id,
    phone_number: profile.phone_number,
    displayName: profile.display_name,
    role: profile.role,
    grade: profile.grade,
  };
}

export function registerErrorResponse(error: AuthError) {
  const duplicateCodes = new Set([
    "user_already_exists",
    "email_exists",
    "phone_exists",
    "identity_already_exists",
  ]);

  if (duplicateCodes.has(error.code ?? "")) {
    return jsonResponse(
      {
        error: {
          code: "PHONE_ALREADY_REGISTERED",
          message: "Số điện thoại đã được đăng ký.",
        },
      },
      409,
    );
  }

  return jsonResponse(
    {
      error: {
        code: "REGISTER_FAILED",
        message: "Không thể đăng ký tài khoản.",
      },
    },
    error.status && error.status >= 500 ? 502 : 400,
  );
}

export function loginErrorResponse(error: AuthError) {
  const isInvalidCredentials =
    error.code === "invalid_credentials" || error.status === 400;

  return jsonResponse(
    {
      error: {
        code: isInvalidCredentials ? "INVALID_CREDENTIALS" : "LOGIN_FAILED",
        message: isInvalidCredentials
          ? "Số điện thoại hoặc mật khẩu không đúng."
          : "Không thể đăng nhập vào lúc này.",
      },
    },
    isInvalidCredentials ? 401 : 502,
  );
}
