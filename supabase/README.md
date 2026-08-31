# Supabase cho Mathiz

Thư mục này mới chỉ chuẩn bị schema PostgreSQL ban đầu. Chưa có Supabase project, Storage bucket, kết nối ứng dụng hoặc dữ liệu thật nào được tạo.

## Nội dung migration

`migrations/0001_initial_schema.sql` tạo các bảng gia đình, hồ sơ phụ huynh, hồ sơ bé, đề thi có version, câu hỏi, asset, lượt làm bài và câu trả lời. Migration cũng thêm khóa ngoại, constraint, index, trigger `updated_at` và Row Level Security (RLS).

Policy hiện tại chỉ phục vụ phụ huynh đã đăng nhập bằng Supabase Auth. Trẻ chưa có Auth user và không được truy cập trực tiếp bằng anon key. Cơ chế child session/PIN sẽ được thiết kế trong giai đoạn sau.

## Chuẩn bị Supabase sau này

1. Tạo một Supabase project trong dashboard khi dự án bước sang giai đoạn tích hợp.
2. Sao chép `.env.example` thành `.env.local` và điền URL cùng publishable key của project.
3. Chỉ đặt `SUPABASE_SERVICE_ROLE_KEY` ở môi trường server đáng tin cậy nếu thực sự cần. Không bao giờ đưa khóa này vào trình duyệt hoặc commit secret thật.
4. Áp dụng `0001_initial_schema.sql` bằng một trong hai cách:
   - Dán và chạy migration trong SQL Editor của Supabase Dashboard.
   - Cài Supabase CLI theo tài liệu chính thức, liên kết project rồi chạy quy trình migration phù hợp.

Repository không giả định Supabase CLI hoặc Docker đã được cài. Hãy đọc và rà soát migration trước khi chạy trên môi trường có dữ liệu.

## Mô hình quyền hiện tại

- Người tạo family có thể tạo hồ sơ phụ huynh của chính mình và quản lý family đó.
- Phụ huynh chỉ truy cập dữ liệu thuộc family của mình.
- `parent_profiles.user_id` phải là `auth.uid()` khi tự tạo hoặc sửa hồ sơ.
- Không có policy cho role `anon` và quyền bảng của `anon` bị thu hồi rõ ràng.
- Helper RLS đặt trong schema `private`, dùng `SECURITY DEFINER`, khóa `search_path` và chỉ cấp quyền thực thi cho `authenticated` để tránh policy đệ quy.
