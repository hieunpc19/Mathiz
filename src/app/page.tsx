import Link from "next/link";

const routeGroups = [
  {
    title: "Bắt đầu",
    routes: [
      ["/login", "Đăng nhập"],
      ["/select-profile", "Chọn hồ sơ"],
    ],
  },
  {
    title: "Học sinh",
    routes: [
      ["/student/exams", "Danh sách đề"],
      ["/student/exams/demo", "Chi tiết đề mẫu"],
      ["/student/attempts/demo", "Lượt làm bài mẫu"],
      ["/student/results/demo", "Kết quả mẫu"],
    ],
  },
  {
    title: "Phụ huynh",
    routes: [
      ["/parent/dashboard", "Tổng quan"],
      ["/parent/exams", "Quản lý đề"],
      ["/parent/exams/import", "Import đề"],
      ["/parent/exams/demo/preview", "Xem trước đề mẫu"],
      ["/parent/children", "Hồ sơ các bé"],
    ],
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-10 sm:px-8 lg:py-16">
      <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-sm font-semibold tracking-[0.18em] text-teal-700 uppercase">
          Nền tảng ban đầu
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          Mathiz
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Website luyện thi Toán cho học sinh lớp 1–2, được thiết kế để bé làm
          bài thuận tiện và phụ huynh quản lý nội dung, kết quả.
        </p>
        <p className="mt-5 inline-flex rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 ring-1 ring-amber-200">
          Đây là codebase nền tảng, chưa phải MVP và chưa có dữ liệu thật.
        </p>
      </section>

      <section aria-labelledby="routes-title" className="mt-10">
        <h2 id="routes-title" className="text-2xl font-bold text-slate-950">
          Kiểm tra các route
        </h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {routeGroups.map((group) => (
            <article
              key={group.title}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <h3 className="font-semibold text-slate-900">{group.title}</h3>
              <ul className="mt-4 space-y-2">
                {group.routes.map(([href, label]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="block rounded-lg px-3 py-2 text-sm text-teal-800 transition-colors hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                    >
                      {label}
                      <span className="mt-0.5 block font-mono text-xs text-slate-500">
                        {href}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
