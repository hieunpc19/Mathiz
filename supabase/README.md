# Supabase cho Mathiz

## Migration

- `0001_initial_schema.sql`: schema family/parent ban đầu, đã được áp dụng trước khi yêu cầu nghiệp vụ thay đổi.
- `0002_user_roles.sql`: migration chuyển tiếp có chủ đích xóa schema cũ và tạo mô hình admin/student. Migration này làm mất dữ liệu trong các bảng ứng dụng cũ; dự án đã xác nhận các bảng chưa có dữ liệu.
- `0003_api_only_exam_access.sql`: buộc dữ liệu đề/lượt thi đi qua API server; client đăng nhập chỉ còn quyền đọc profile.

Chạy `0002_user_roles.sql`, sau đó `0003_api_only_exam_access.sql` trên Supabase sau khi đọc và kiểm tra ở môi trường thử nghiệm. Ứng dụng không tự chạy migration.

## Mô hình quyền

- Mỗi Supabase Auth user có một hàng trong `public.profiles`.
- Trigger `on_auth_user_created` tự tạo profile role `student` khi Auth user được tạo.
- Đăng ký công khai không thể chọn role.
- Admin xem và quản lý toàn bộ profile, đề thi, nội dung đề và lượt làm bài.
- Học sinh chỉ xem đề `published`, tạo nhiều lượt làm bài và truy cập lượt làm bài của chính mình.
- Trigger bảo vệ không cho học sinh tự ghi các trường chấm điểm.
- Role `anon` không có quyền trên các bảng ứng dụng.

Để nâng một Auth user thành admin, chạy bằng SQL Editor với UUID chính xác:

```sql
update public.profiles
set role = 'admin', grade = null
where user_id = 'AUTH_USER_UUID';
```

Không cho phép client tự chọn hoặc cập nhật role.

Hãy tạo tài khoản admin qua API đăng ký như một học sinh bình thường trước, sau đó chạy câu lệnh trên để nâng role. Không tạo trực tiếp trong Authentication Dashboard vì trigger yêu cầu metadata `phone_number` hợp lệ.

## Cấu hình Auth không dùng SMS

Trong Supabase Dashboard:

1. Để Phone provider ở trạng thái tắt; không cần nhà cung cấp SMS.
2. Bật Email provider và cho phép đăng ký user mới.
3. Tắt `Confirm email`, vì email chỉ là định danh nội bộ do server tạo ra và không có hộp thư thật.
4. Tạo `AUTH_IDENTIFIER_SECRET` ngẫu nhiên, tối thiểu 32 ký tự, trong `.env.local` và môi trường production.

Có thể tạo secret 32 byte bằng Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Không thay đổi hoặc làm mất secret sau khi đã có user. Server ánh xạ cùng một số điện thoại thành cùng một email Auth bằng HMAC-SHA256; đổi secret sẽ khiến tài khoản cũ không đăng nhập được.

Số điện thoại thật được lưu duy nhất trong `public.profiles.phone_number` theo E.164, ví dụ `+84901234567`. Email nội bộ không được trả về API.

Vì email không có hộp thư thật và không dùng SMS, học sinh không thể tự khôi phục mật khẩu. Cần bổ sung luồng admin đặt lại mật khẩu khi tính năng đó được yêu cầu.
