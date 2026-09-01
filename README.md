# Mathiz

Mathiz là nền tảng luyện thi Toán dùng Next.js App Router và Supabase. Mô hình hiện tại có hai loại tài khoản: admin tạo và quản lý đề; học sinh làm đề và xem dữ liệu của mình. Chưa có role phụ huynh.

## Tech stack

- Next.js 16.3.3, React 19, TypeScript strict
- Tailwind CSS 4
- Supabase Auth, PostgreSQL và Row Level Security
- Node.js 24 LTS, npm

## Chạy dự án

```bash
npm install
npm run dev
```

Tạo `.env` từ `.env.example` và điền:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
AUTH_IDENTIFIER_SECRET=RANDOM_SECRET_AT_LEAST_32_CHARACTERS
```

API xác thực không sử dụng service-role key. Session được lưu trong cookie `HttpOnly`, `SameSite=Lax`, và chỉ dùng cookie `Secure` trên production.

API nhận số điện thoại nhưng không bật Supabase Phone Auth. Server dùng HMAC-SHA256 cùng `AUTH_IDENTIFIER_SECRET` để tạo một email nội bộ ổn định rồi xác thực qua Email Auth. Email nội bộ không được trả về client. Không thay đổi secret sau khi đã có user, vì việc đó sẽ thay đổi toàn bộ định danh đăng nhập.

Luồng này không thể tự khôi phục mật khẩu qua SMS hoặc email. Khi cần, admin phải đặt lại mật khẩu cho học sinh bằng một luồng quản trị riêng.

## API xác thực

### `POST /api/auth/register`

Đăng ký công khai luôn tạo học sinh:

```json
{
  "phone_number": "+84901234567",
  "password": "mat-khau-toi-thieu-8-ky-tu",
  "displayName": "Nguyễn An",
  "grade": 2
}
```

Điều kiện:

- `phone_number`: định dạng quốc tế E.164.
- `password`: từ 8 đến 72 ký tự.
- `displayName`: từ 1 đến 120 ký tự.
- `grade`: số nguyên từ 1 đến 12.

Phản hồi thành công trả HTTP `201`, thông tin user không chứa token và `sessionEstablished: true` khi Supabase đã tắt `Confirm email`.

### `POST /api/auth/login`

```json
{
  "phone_number": "+84901234567",
  "password": "mat-khau-toi-thieu-8-ky-tu"
}
```

Phản hồi thành công trả HTTP `200`, profile và `sessionEstablished: true`. Sai thông tin đăng nhập trả `401`; lỗi validation trả `422`.

## Database

Migration `supabase/migrations/0002_user_roles.sql` thay mô hình family/parent/child bằng:

- `profiles`: profile của Auth user với role `admin` hoặc `student`.
- `exams`, `exam_versions`, `questions`, `assets`: nội dung do admin quản lý.
- `attempts`, `attempt_answers`: lượt làm bài gắn trực tiếp với Auth user học sinh.

Migration bật RLS cho mọi bảng. Admin có quyền toàn cục; học sinh chỉ xem đề đã xuất bản và dữ liệu làm bài của chính mình. Xem hướng dẫn áp dụng migration và tạo admin tại `supabase/README.md`.

## Import và thi bằng dữ liệu thật

Các gói nguồn chuẩn được đặt trong `data/`. Lệnh sau import gói mặc định thành một bản nháp mới với lớp 1–5 và 90 phút:

```bash
npm run import:exam
```

Admin đã đăng nhập có thể import qua API và tùy chỉnh thời gian/khối lớp:

```http
POST /api/admin/exams/import
Content-Type: application/json

{
  "packageFile": "timo-preliminary-2020-2021-set-01.zip",
  "durationMinutes": 90,
  "gradeMin": 1,
  "gradeMax": 5
}
```

`GET /api/admin/exams/import` trả danh sách ZIP hợp lệ trong `data/`. Mỗi lần import luôn tạo một `exam_version` nháp mới, kể cả khi cùng gói đã được import trước đó. Importer kiểm tra manifest, số câu, lựa chọn và toàn bộ ảnh trước khi ghi. Ảnh nằm trong private Storage bucket `exam-assets`; đáp án được mã hóa trong database.

Admin chỉnh metadata, câu hỏi, lựa chọn, đáp án, điểm, lời giải, thứ tự và ảnh tại `/admin/exams/:examId/versions/:versionId`. Một đề có thể giữ nhiều draft song song. Phiên bản đã xuất bản là bất biến; muốn sửa phải clone thành draft mới. API publish kiểm tra thời gian, khối lớp, nội dung câu, điểm, đáp án và asset trước khi chuyển `current_version_id`.

Luồng API học sinh:

- `GET /api/exams` và `GET /api/exams/:examId`: danh sách/thông tin đề.
- `POST /api/exams/:examId/attempts`: tạo lượt thi và deadline phía server.
- `GET /api/attempts/:attemptId`: tải đề, không trả đáp án chuẩn.
- `PUT /api/attempts/:attemptId/answers`: lưu hoặc xóa một đáp án.
- `POST /api/attempts/:attemptId/submit`: khóa bài và chấm trên server.
- `GET /api/attempts/:attemptId/result`: trả điểm và đáp án sau khi nộp.

## Kiểm tra chất lượng

```bash
npm run lint
npm run typecheck
npm run build
npm run import:exam
```
