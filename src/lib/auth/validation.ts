export type RegisterInput = {
  phone_number: string;
  password: string;
  displayName: string;
  grade: number;
};

export type LoginInput = {
  phone_number: string;
  password: string;
};

type ValidationResult<T> =
  { success: true; data: T } | { success: false; message: string };

const E164_PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateCredentials(
  value: unknown,
): ValidationResult<{ phone_number: string; password: string }> {
  if (!isRecord(value)) {
    return { success: false, message: "Dữ liệu gửi lên không hợp lệ." };
  }

  const phoneNumber =
    typeof value.phone_number === "string" ? value.phone_number.trim() : "";
  const password = typeof value.password === "string" ? value.password : "";

  if (!E164_PHONE_PATTERN.test(phoneNumber)) {
    return {
      success: false,
      message:
        "Số điện thoại phải theo định dạng quốc tế E.164, ví dụ +84901234567.",
    };
  }

  if (password.length < 8 || password.length > 72) {
    return {
      success: false,
      message: "Mật khẩu phải có từ 8 đến 72 ký tự.",
    };
  }

  return {
    success: true,
    data: { phone_number: phoneNumber, password },
  };
}

export function validateLoginInput(
  value: unknown,
): ValidationResult<LoginInput> {
  return validateCredentials(value);
}

export function validateRegisterInput(
  value: unknown,
): ValidationResult<RegisterInput> {
  const credentials = validateCredentials(value);

  if (!credentials.success) {
    return credentials;
  }

  if (!isRecord(value)) {
    return { success: false, message: "Dữ liệu gửi lên không hợp lệ." };
  }

  const displayName =
    typeof value.displayName === "string" ? value.displayName.trim() : "";
  const grade = value.grade;

  if (displayName.length < 1 || displayName.length > 120) {
    return {
      success: false,
      message: "Tên hiển thị phải có từ 1 đến 120 ký tự.",
    };
  }

  if (
    !Number.isInteger(grade) ||
    (grade as number) < 1 ||
    (grade as number) > 12
  ) {
    return {
      success: false,
      message: "Khối lớp phải là số nguyên từ 1 đến 12.",
    };
  }

  return {
    success: true,
    data: {
      ...credentials.data,
      displayName,
      grade: grade as number,
    },
  };
}
