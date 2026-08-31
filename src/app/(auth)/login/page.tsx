import { RoutePlaceholder } from "@/components/route-placeholder";

export default function LoginPage() {
  return (
    <RoutePlaceholder
      title="Đăng nhập phụ huynh"
      description="Trang này sau này sẽ dùng Supabase Auth để xác thực tài khoản phụ huynh."
      route="/login"
    />
  );
}
