import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-5 text-center">
      <p className="text-sm font-semibold tracking-wider text-teal-700 uppercase">
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold text-slate-950">
        Không tìm thấy trang
      </h1>
      <p className="mt-4 text-slate-600">
        Đường dẫn này chưa tồn tại trong codebase Mathiz.
      </p>
      <Link
        href="/"
        className="mt-7 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      >
        Về trang chủ
      </Link>
    </main>
  );
}
