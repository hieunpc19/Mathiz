# Mathiz

Mathiz là nền tảng luyện thi Toán dành cho học sinh lớp 1–2, phục vụ một gia đình nhỏ. Mục tiêu dài hạn là giúp phụ huynh chuẩn hóa, xem trước và xuất bản đề; giúp bé làm bài trên iPad hoặc laptop; và lưu lại điểm, thời gian cùng lịch sử từng câu.

Repository hiện tại chỉ là **codebase nền tảng**, chưa phải MVP.

## Phạm vi đã triển khai

- Next.js App Router với TypeScript strict, cấu trúc `src/` và alias `@/*`.
- Route groups cho khu vực truy cập, học sinh và phụ huynh.
- Placeholder responsive bằng tiếng Việt để kiểm tra thủ công các route.
- Health endpoint trả JSON.
- Tailwind CSS, ESLint và Prettier.
- Supabase PostgreSQL migration ban đầu gồm schema, constraint, index, trigger và RLS dành cho phụ huynh.
- Mẫu biến môi trường không chứa secret.

Chưa triển khai đăng nhập, kết nối Supabase, import/parse Markdown hoặc LaTeX, upload, OCR/AI, chấm điểm, đồng hồ, autosave, bảo vệ route, child session/PIN, test framework hay deploy Vercel.

## Tech stack

- Next.js 16.3.3 (App Router)
- React 19.2.8
- TypeScript 5, strict mode
- Tailwind CSS 4
- ESLint 9 với `eslint-config-next`
- Prettier 3
- npm và `package-lock.json`
- PostgreSQL tương thích Supabase (chưa kết nối)

## Yêu cầu môi trường

- Node.js 24 LTS (`.nvmrc`; `package.json` giới hạn `>=24 <25`)
- npm đi kèm Node.js

Không bắt buộc cài Supabase CLI hoặc Docker trong giai đoạn này.

## Cài đặt và chạy

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`. Không cần biến môi trường để xem các placeholder hiện tại.

## Các lệnh npm

| Lệnh                   | Mục đích                                      |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Chạy development server                       |
| `npm run build`        | Tạo production build                          |
| `npm run start`        | Chạy production server sau khi build          |
| `npm run lint`         | Kiểm tra toàn bộ repository bằng ESLint       |
| `npm run typecheck`    | Kiểm tra TypeScript mà không phát sinh output |
| `npm run format`       | Định dạng file bằng Prettier                  |
| `npm run format:check` | Xác minh định dạng Prettier                   |

## Cấu trúc thư mục

```text
Mathiz/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (student)/student/
│   │   ├── (parent)/parent/
│   │   ├── api/health/
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   └── components/
│       ├── app-shell.tsx
│       ├── navigation.tsx
│       └── route-placeholder.tsx
├── supabase/
│   ├── migrations/0001_initial_schema.sql
│   └── README.md
├── .env.example
├── .nvmrc
└── package.json
```

## Route

| URL                              | Mục đích dự kiến                               |
| -------------------------------- | ---------------------------------------------- |
| `/`                              | Giới thiệu nền tảng và liên kết kiểm tra route |
| `/login`                         | Đăng nhập phụ huynh bằng Supabase Auth         |
| `/select-profile`                | Chọn khu vực hoặc hồ sơ bé                     |
| `/student/exams`                 | Danh sách đề dành cho bé                       |
| `/student/exams/[examId]`        | Thông tin một đề                               |
| `/student/attempts/[attemptId]`  | Màn hình làm bài                               |
| `/student/results/[attemptId]`   | Kết quả một lượt làm bài                       |
| `/parent/dashboard`              | Tổng quan hoạt động gia đình                   |
| `/parent/exams`                  | Quản lý đề thi                                 |
| `/parent/exams/import`           | Import nguồn đề đã chuẩn hóa                   |
| `/parent/exams/[examId]/preview` | Xem trước một đề trước khi xuất bản            |
| `/parent/children`               | Quản lý hồ sơ các bé                           |
| `GET /api/health`                | Trả `{"status":"ok","service":"mathiz"}`       |

Các URL động có thể được kiểm tra bằng giá trị bất kỳ, ví dụ `/student/exams/demo`. Chúng chỉ hiển thị placeholder và không truy vấn dữ liệu.

## Tổng quan database

Migration `supabase/migrations/0001_initial_schema.sql` tạo chín bảng:

- `families`, `parent_profiles`, `children`
- `exams`, `exam_versions`, `questions`, `assets`
- `attempts`, `attempt_answers`

Schema dùng UUID, khóa ngoại và hành vi xóa rõ ràng; unique/check constraint; index cho khóa ngoại và truy vấn chính; trigger cập nhật `updated_at`; cùng quan hệ version hiện tại của đề. Không có seed data hoặc nội dung đề có bản quyền.

RLS được bật trên mọi bảng public. Policy hiện chỉ cho phụ huynh đã xác thực truy cập dữ liệu thuộc family của họ. Helper trong schema `private` tránh policy đệ quy và khóa `search_path`. Role `anon` không có policy và bị thu hồi quyền bảng.

## Biến môi trường

Sao chép file mẫu khi bắt đầu tích hợp Supabase:

```bash
cp .env.example .env.local
```

Trên PowerShell có thể dùng:

```powershell
Copy-Item .env.example .env.local
```

| Biến                                   | Phạm vi                                                  |
| -------------------------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Public; URL của Supabase project                         |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public; có thể xuất hiện trong trình duyệt               |
| `SUPABASE_SERVICE_ROLE_KEY`            | Chỉ server; có thể bỏ qua RLS và phải bảo vệ nghiêm ngặt |

Mọi biến `NEXT_PUBLIC_*` có thể xuất hiện trong mã gửi tới trình duyệt. Không bao giờ dùng service-role key ở frontend và không commit secret thật. `.env.local` đã được Git ignore.

## Chuẩn bị Supabase sau này

Khi sẵn sàng tích hợp, tạo project trên Supabase Dashboard, điền các biến môi trường, rồi áp dụng migration bằng SQL Editor hoặc Supabase CLI. Không có project hoặc tài nguyên bên ngoài nào được tạo trong lần khởi tạo này. Xem hướng dẫn chi tiết tại `supabase/README.md`.

## Nguyên tắc bảo mật

- Xem RLS là lớp bảo vệ dữ liệu bắt buộc, không chỉ dựa vào UI hoặc middleware.
- Chỉ dùng publishable key ở client; service-role key chỉ ở server đáng tin cậy.
- Không lưu PIN dạng plaintext; cột `pin_hash` chỉ dành cho hash do server tạo sau này.
- Kiểm tra family ownership ở mọi luồng ghi dữ liệu.
- Rà soát policy và migration trên môi trường thử nghiệm trước khi áp dụng production.
- Xác định provenance và quyền sử dụng trước khi lưu nội dung đề hoặc asset.

## Roadmap gợi ý

1. Tạo Supabase project thử nghiệm và tích hợp Auth cho phụ huynh.
2. Hoàn thiện onboarding family, parent profile và hồ sơ bé.
3. Xây pipeline import, validate, preview và version hóa đề.
4. Thiết kế child session/PIN an toàn trước khi mở quyền cho học sinh.
5. Xây exam runner, autosave, deadline và quy tắc nộp bài.
6. Thêm chấm điểm, lịch sử kết quả và test tự động.
7. Rà soát bảo mật, khả năng truy cập và triển khai Vercel.
