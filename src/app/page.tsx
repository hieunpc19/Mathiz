import Link from "next/link";
import {
  Sparkles,
  Trophy,
  Pencil,
  Keyboard,
  BookOpen,
  ArrowRight,
  LogIn,
  CheckCircle2,
  Medal,
  Clock,
  Tablet,
  HelpCircle,
  Zap,
  Target,
  Check,
  Star,
  Layers,
  Flame,
  Lightbulb,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* 1. STICKY HEADER NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 font-heading text-xl font-black text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
              M
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition">
                Mathiz
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 -mt-1">
                Toán Olympic Tiểu Học
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-bold text-slate-600">
            <a href="#competitions" className="hover:text-blue-600 transition">
              Kỳ thi Olympic
            </a>
            <a href="#features" className="hover:text-blue-600 transition">
              Tính năng nổi bật
            </a>
            <a href="#preview" className="hover:text-blue-600 transition">
              Giao diện thi
            </a>
            <a href="#roadmap" className="hover:text-blue-600 transition">
              Lộ trình Lớp 1–5
            </a>
            <a href="#faq" className="hover:text-blue-600 transition">
              Hỏi đáp
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 hover:text-blue-800 transition"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Đăng nhập</span>
            </Link>

            <Link
              href="/login?mode=register"
              className="tactile-btn tactile-btn-amber inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-300 transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Luyện thi ngay</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-950 bg-gradient-to-b from-blue-950 via-indigo-950 to-slate-950 pt-14 pb-20 text-white sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-32">
        {/* Math Grid Pattern Overlay */}
        <div className="pointer-events-none absolute inset-0 math-grid-pattern opacity-60" />

        {/* Glowing backdrop orbs */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[700px] rounded-full bg-blue-600/25 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Top Super-Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-xs font-black tracking-wide text-amber-300 backdrop-blur-md shadow-lg shadow-black/20">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>ĐẤU TRƯỜNG TOÁN OLYMPIC TIỂU HỌC • LỚP 1 ĐẾN LỚP 5</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-6 font-heading text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.15]">
              Khơi dậy đam mê & Chinh Phục{" "}
              <span className="bg-linear-to-r from-amber-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent underline decoration-amber-400/50 underline-offset-8">
                <br />
                Toán Olympic Quốc Tế
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-base leading-relaxed text-slate-200 sm:text-lg lg:text-xl max-w-3xl mx-auto font-medium">
              Nền tảng luyện thi chuẩn đề quốc tế <strong className="text-white font-bold">TIMO, IKMC, SASMO, HKIMO</strong>.
            </p>

            {/* CTA Buttons */}
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login?mode=register"
                className="tactile-btn tactile-btn-amber flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-amber-400 px-8 py-4 font-heading text-base font-black text-slate-950 hover:bg-amber-300 shadow-xl"
              >
                <Sparkles className="h-5 w-5 text-slate-950" />
                <span>Bắt đầu luyện thi miễn phí</span>
                <ArrowRight className="h-5 w-5 ml-0.5" />
              </Link>

              <Link
                href="/student/exams"
                className="tactile-btn tactile-btn-white flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border-2 border-white/40 bg-white/10 px-7 py-4 font-heading text-base font-bold text-white backdrop-blur-md hover:bg-white/20"
              >
                <BookOpen className="h-5 w-5 text-blue-200" />
                <span>Khám phá kho đề thi</span>
              </Link>
            </div>

            {/* Trust Metrics Pill */}
            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 rounded-3xl border border-slate-700/80 bg-slate-900/90 p-4 sm:p-5 backdrop-blur-md shadow-2xl">
              <div className="text-center">
                <div className="font-heading text-2xl sm:text-3xl font-black text-amber-400">10.000+</div>
                <div className="mt-1 text-xs font-semibold text-slate-300">Lượt làm bài thi</div>
              </div>
              <div className="text-center border-l border-slate-800">
                <div className="font-heading text-2xl sm:text-3xl font-black text-emerald-400">50+</div>
                <div className="mt-1 text-xs font-semibold text-slate-300">Bộ đề Olympic chuẩn</div>
              </div>
              <div className="text-center border-l border-slate-800">
                <div className="font-heading text-2xl sm:text-3xl font-black text-pink-400">100%</div>
                <div className="mt-1 text-xs font-semibold text-slate-300">Lời giải chi tiết từng bước</div>
              </div>
              <div className="text-center border-l border-slate-800">
                <div className="font-heading text-2xl sm:text-3xl font-black text-yellow-400">4.9 / 5⭐</div>
                <div className="mt-1 text-xs font-semibold text-slate-300">Phụ huynh & bé yêu thích</div>
              </div>
            </div>
          </div>

          {/* 3. HERO EXAM SCREEN MOCKUP */}
          <div id="preview" className="relative mt-12 sm:mt-16 mx-auto max-w-5xl">
            {/* Soft decorative glow behind mockup */}
            <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-amber-400 via-pink-500 to-blue-500 opacity-30 blur-xl" />

            {/* Mockup Container */}
            <div className="relative overflow-hidden rounded-3xl border-4 border-slate-800 bg-slate-950 shadow-2xl">
              {/* Mockup Browser/App Header */}
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 text-white">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500" />
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 text-xs font-bold text-slate-300 hidden sm:inline">
                    Phòng thi Mathiz • TIMO Vòng Quốc Gia 2024 (Khối 3)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-2.5 py-1 text-xs font-bold text-red-300 border border-red-500/30">
                    <Clock className="h-3.5 w-3.5 animate-pulse text-red-400" />
                    <span>58:24</span>
                  </div>
                  <div className="rounded-lg bg-blue-500/20 px-2.5 py-1 text-xs font-bold text-blue-300 border border-blue-500/30">
                    Câu 07 / 25
                  </div>
                </div>
              </div>

              {/* Mockup Exam Content Body (Dual-pane UI representation) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 bg-slate-100 text-slate-900 p-4 sm:p-6 gap-4">
                {/* Left Pane: Question & Choices */}
                <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                        <Flame className="h-3.5 w-3.5 text-amber-500" />
                        Chủ đề: Tư duy Logic & Số học
                      </span>
                      <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        +4 Điểm
                      </span>
                    </div>

                    <div className="mt-3 font-heading text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                      Câu 7: Một đàn vịt có 36 con đang bơi dưới hồ. Sau đó có thêm một số con vịt bơi đến, biết rằng số vịt mới đến bằng một nửa số vịt ban đầu. Hỏi sau cùng đàn vịt có tất cả bao nhiêu con?
                    </div>

                    {/* Question Math Representation Formula Box */}
                    <div className="mt-3 rounded-xl bg-slate-50 p-3 text-center border border-slate-200 font-mono text-xs text-blue-700 font-bold">
                      Tổng số vịt = 36 + (36 ÷ 2) = ?
                    </div>

                    {/* Multiple Choice Options */}
                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-700">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 font-black text-slate-600">A</span>
                        <span>48 con vịt</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border-2 border-blue-600 bg-blue-50/80 p-3 text-xs font-black text-blue-900 shadow-xs">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 font-black text-white">B</span>
                        <span>54 con vịt</span>
                        <Check className="h-4 w-4 ml-auto text-blue-600" />
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-700">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 font-black text-slate-600">C</span>
                        <span>52 con vịt</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-700">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 font-black text-slate-600">D</span>
                        <span>60 con vịt</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <span>💡 Phím tắt nhanh: bấm phím <strong>2</strong> trên bàn phím</span>
                    <span className="font-bold text-emerald-600">✓ Đã tự động lưu đáp án</span>
                  </div>
                </div>

                {/* Right Pane: Smart iPad Scratchpad Simulation */}
                <div className="lg:col-span-5 flex flex-col rounded-2xl border-2 border-indigo-200 bg-slate-900 text-white p-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Pencil className="h-4 w-4 text-amber-400" />
                      <span className="text-xs font-bold text-slate-200">Bảng nháp cảm ứng iPad</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Apple Pencil Sẵn sàng
                    </div>
                  </div>

                  {/* Simulated Handwriting in Scratchpad */}
                  <div className="relative flex-1 min-h-[160px] rounded-xl bg-slate-950/60 p-4 border border-slate-800 mt-2.5 flex flex-col justify-center">
                    <div className="font-mono text-xs space-y-2 text-amber-300">
                      <p className="text-slate-400 font-sans text-[11px]">{"// Nháp tính của bé:"}</p>
                      <p>Số vịt mới đến = 36 ÷ 2 = 18</p>
                      <p>Tổng cộng = 36 + 18 = 54 (chọn B) ✓</p>
                    </div>

                    {/* Visual Stamp */}
                    <div className="absolute right-3 bottom-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2 py-1 text-[10px] font-bold text-emerald-300">
                      Đã lưu nét vẽ
                    </div>
                  </div>

                  {/* Tactile Drawing Controls Bar */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-md bg-blue-600/30 px-2 py-1 text-[10px] font-bold text-blue-300">Bút mực</span>
                      <span className="rounded-md bg-slate-800 px-2 py-1 text-[10px] text-slate-400">Tẩy</span>
                      <span className="rounded-md bg-slate-800 px-2 py-1 text-[10px] text-slate-400">Xóa hết</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Hỗ trợ ngón tay & bút</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OLYMPIC COMPETITIONS SHOWCASE */}
      <section id="competitions" className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-extrabold text-blue-700 ring-1 ring-blue-700/10">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              ĐẤU TRƯỜNG TOÁN QUỐC TẾ
            </span>
            <h2 className="mt-3 font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Đồng hành cùng mọi Kỳ thi Toán Olympic
            </h2>
          </div>

          {/* Competitions Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* TIMO */}
            <div className="tactile-card rounded-3xl border-2 border-amber-200 bg-linear-to-b from-amber-50/50 to-white p-6 shadow-sm hover:border-amber-400">
              <div className="flex items-center justify-between">
                <span className="rounded-xl bg-amber-400 px-3 py-1 text-xs font-black text-slate-950">
                  TIMO
                </span>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg">
                  Lớp 1 – 5
                </span>
              </div>
              <h3 className="mt-4 font-heading text-xl font-extrabold text-slate-900">
                Thailand International Mathematical Olympiad
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Kỳ thi Toán quốc tế Thái Lan với 5 khối kiến thức: Tư duy logic, Số học, Đại số, Hình học và Tổ hợp.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 border-t border-amber-100 pt-4 text-xs font-semibold text-slate-700">
                <div>⏱ <strong>90 phút</strong> làm bài</div>
                <div>📝 <strong>25 câu hỏi</strong> trắc nghiệm/điền số</div>
              </div>
            </div>

            {/* IKMC - Kangaroo */}
            <div className="tactile-card rounded-3xl border-2 border-blue-200 bg-linear-to-b from-blue-50/50 to-white p-6 shadow-sm hover:border-blue-400">
              <div className="flex items-center justify-between">
                <span className="rounded-xl bg-blue-600 px-3 py-1 text-xs font-black text-white">
                  IKMC (Kangaroo)
                </span>
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">
                  Lớp 1 – 5
                </span>
              </div>
              <h3 className="mt-4 font-heading text-xl font-extrabold text-slate-900">
                International Kangaroo Math Contest
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Đấu trường Toán học tư duy lớn nhất thế giới với các bài toán trực quan sinh động, phát triển khả năng liên tưởng.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 border-t border-blue-100 pt-4 text-xs font-semibold text-slate-700">
                <div>⏱ <strong>75 phút</strong> làm bài</div>
                <div>📝 <strong>Phân 3 mức điểm</strong> 3–4–5 điểm</div>
              </div>
            </div>

            {/* SASMO */}
            <div className="tactile-card rounded-3xl border-2 border-indigo-200 bg-linear-to-b from-indigo-50/50 to-white p-6 shadow-sm hover:border-indigo-400">
              <div className="flex items-center justify-between">
                <span className="rounded-xl bg-indigo-600 px-3 py-1 text-xs font-black text-white">
                  SASMO
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-lg">
                  Lớp 2 – 5
                </span>
              </div>
              <h3 className="mt-4 font-heading text-xl font-extrabold text-slate-900">
                Singapore and Asian Schools Math Olympiad
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Kỳ thi Toán Singapore chuẩn mực kết hợp trắc nghiệm có phạt điểm câu sai và phần điền đáp số tư duy sâu.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 border-t border-indigo-100 pt-4 text-xs font-semibold text-slate-700">
                <div>⏱ <strong>90 phút</strong> làm bài</div>
                <div>📝 <strong>25 câu</strong> (Phần A & Phần B)</div>
              </div>
            </div>

            {/* HKIMO */}
            <div className="tactile-card rounded-3xl border-2 border-emerald-200 bg-linear-to-b from-emerald-50/50 to-white p-6 shadow-sm hover:border-emerald-400">
              <div className="flex items-center justify-between">
                <span className="rounded-xl bg-emerald-600 px-3 py-1 text-xs font-black text-white">
                  HKIMO
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                  Lớp 1 – 5
                </span>
              </div>
              <h3 className="mt-4 font-heading text-xl font-extrabold text-slate-900">
                Hong Kong International Mathematical Olympiad
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Đấu trường Toán quốc tế Hồng Kông rèn luyện kỹ năng giải nhanh, phát hiện quy luật và tính toán tư duy nhạy bén.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 border-t border-emerald-100 pt-4 text-xs font-semibold text-slate-700">
                <div>⏱ <strong>90 phút</strong> làm bài</div>
                <div>📝 <strong>25 câu</strong> điền kết quả</div>
              </div>
            </div>

            {/* ASMO */}
            <div className="tactile-card rounded-3xl border-2 border-pink-200 bg-linear-to-b from-pink-50/50 to-white p-6 shadow-sm hover:border-pink-400">
              <div className="flex items-center justify-between">
                <span className="rounded-xl bg-pink-600 px-3 py-1 text-xs font-black text-white">
                  ASMO
                </span>
                <span className="text-xs font-bold text-pink-700 bg-pink-100 px-2.5 py-1 rounded-lg">
                  Lớp 1 – 5
                </span>
              </div>
              <h3 className="mt-4 font-heading text-xl font-extrabold text-slate-900">
                Asian Science and Mathematics Olympiad
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Kỳ thi Olympic Toán học và Khoa học châu Á với cấu trúc đề thi đa dạng, kích thích tinh thần khám phá khoa học.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 border-t border-pink-100 pt-4 text-xs font-semibold text-slate-700">
                <div>⏱ <strong>60–90 phút</strong></div>
                <div>📝 <strong>Trắc nghiệm & Tự luận</strong></div>
              </div>
            </div>

            {/* VTMO & VioEdu Mock */}
            <div className="tactile-card rounded-3xl border-2 border-slate-200 bg-linear-to-b from-slate-50/50 to-white p-6 shadow-sm hover:border-blue-400">
              <div className="flex items-center justify-between">
                <span className="rounded-xl bg-slate-800 px-3 py-1 text-xs font-black text-white">
                  VTMO / Quốc Gia
                </span>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                  Lớp 1 – 5
                </span>
              </div>
              <h3 className="mt-4 font-heading text-xl font-extrabold text-slate-900">
                Bộ Đề Thi Thử & Luyện Đội Tuyển
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Đề tổng hợp tuyển chọn theo từng chuyên đề giúp học sinh bứt phá điểm số trong các vòng sơ loại và chung kết.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-700">
                <div>⏱ <strong>Linh hoạt</strong></div>
                <div>📝 <strong>Lời giải chi tiết 100%</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURE BENTO GRID */}
      <section id="features" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200 math-grid-pattern-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1.5 text-xs font-extrabold text-amber-800">
              <Zap className="h-3.5 w-3.5 text-amber-600" />
              TỐI ƯU TRẢI NGHIỆM CHO TRẺ
            </span>
            <h2 className="mt-3 font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Công nghệ hiện đại phục vụ việc học Toán
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="tactile-card rounded-3xl border-2 border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 shadow-inner">
                <Pencil className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-heading text-xl font-extrabold text-slate-900">
                Bảng nháp cảm ứng iPad & Bút
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Bé vẽ nháp trực tiếp ngay cạnh đề bài bằng Apple Pencil hoặc ngón tay. Nét vẽ được tự động lưu lại để xem lại khi chữa bài mà không cần giấy bút cồng kềnh.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600">
                <CheckCircle2 className="h-4 w-4" /> Chia đôi màn hình tối ưu iPad
              </div>
            </div>

            {/* Feature 2 */}
            <div className="tactile-card rounded-3xl border-2 border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-inner">
                <Keyboard className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-heading text-xl font-extrabold text-slate-900">
                Bàn phím số xúc giác to rõ
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Thiết kế phím số lớn, phản hồi bấm xúc giác vui tai dành riêng cho các câu hỏi điền số tự nhiên. Hỗ trợ phím tắt 1, 2, 3, 4 trên máy tính laptop.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600">
                <CheckCircle2 className="h-4 w-4" /> Dễ bấm cho các bé lớp 1–2
              </div>
            </div>

            {/* Feature 3 */}
            <div className="tactile-card rounded-3xl border-2 border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner">
                <Lightbulb className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-heading text-xl font-extrabold text-slate-900">
                Chấm điểm & Lời giải từng bước
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Sau khi nộp bài, hệ thống hiển thị điểm số tức thì kèm phân tích đáp án chi tiết, biểu diễn công thức toán học KaTeX rõ ràng chuẩn quốc tế.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Hiểu bản chất câu sai ngay lập tức
              </div>
            </div>

            {/* Feature 4 */}
            <div className="tactile-card rounded-3xl border-2 border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 text-pink-700 shadow-inner">
                <Medal className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-heading text-xl font-extrabold text-slate-900">
                Huy chương & Pháo hoa khích lệ
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Hiệu ứng pháo hoa rực rỡ và bảng xếp hạng Huy chương Vàng, Bạc, Đồng theo chuẩn Olympic giúp tạo cảm hứng và xây dựng sự tự tin cho trẻ.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-pink-600">
                <CheckCircle2 className="h-4 w-4" /> Tạo động lực học tập mỗi ngày
              </div>
            </div>

            {/* Feature 5 */}
            <div className="tactile-card rounded-3xl border-2 border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 shadow-inner">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-heading text-xl font-extrabold text-slate-900">
                Môi trường thi chuẩn kỳ thi thật
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Đồng hồ bấm giờ tự động khóa bài khi hết giờ, rèn luyện kỹ năng phân bổ thời gian và tâm lý phòng thi vững vàng cho bé trước kỳ thi chính thức.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                <CheckCircle2 className="h-4 w-4" /> Rèn bản lĩnh phòng thi Olympic
              </div>
            </div>

            {/* Feature 6 */}
            <div className="tactile-card rounded-3xl border-2 border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 shadow-inner">
                <Tablet className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-heading text-xl font-extrabold text-slate-900">
                Đa nền tảng iPad & Máy tính
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Trải nghiệm mượt mà trên iPad, máy tính bảng Android, MacBook, laptop Windows hay PC bàn mà không cần cài đặt phần mềm phức tạp.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600">
                <CheckCircle2 className="h-4 w-4" /> Chạy mượt trên trình duyệt web
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS: 3 EASY STEPS */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-extrabold text-emerald-800">
              <Target className="h-3.5 w-3.5 text-emerald-600" />
              QUY TRÌNH LUYỆN THI ĐƠN GIẢN
            </span>
            <h2 className="mt-3 font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              3 Bước bứt phá thành tích Toán Olympic
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Chỉ mất 30 giây để bắt đầu bài thi đầu tiên và nâng cao kỹ năng toán học mỗi ngày.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative rounded-3xl border-2 border-slate-200 bg-slate-50 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 font-heading text-2xl font-black text-white shadow-lg shadow-blue-500/30">
                1
              </div>
              <h3 className="mt-6 font-heading text-lg font-bold text-slate-900">
                Đăng ký & Chọn khối lớp
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Đăng ký nhanh bằng số điện thoại của phụ huynh và chọn khối lớp của bé (Lớp 1 đến Lớp 5).
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-3xl border-2 border-amber-200 bg-amber-50/50 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 font-heading text-2xl font-black text-slate-950 shadow-lg shadow-amber-500/30">
                2
              </div>
              <h3 className="mt-6 font-heading text-lg font-bold text-slate-900">
                Làm đề thi có bấm giờ & Bảng nháp
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Làm bài trong không gian thi thật, sử dụng bảng nháp iPad để giải toán và chọn đáp án tức thì.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-3xl border-2 border-emerald-200 bg-emerald-50/50 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 font-heading text-2xl font-black text-white shadow-lg shadow-emerald-500/30">
                3
              </div>
              <h3 className="mt-6 font-heading text-lg font-bold text-slate-900">
                Nhận huy chương & Xem lời giải
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Hệ thống chấm điểm tự động, chúc mừng thành tích và hướng dẫn giải chi tiết cho từng câu hỏi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CURRICULUM ROADMAP BY GRADE */}
      <section id="roadmap" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3.5 py-1.5 text-xs font-extrabold text-indigo-800">
              <Layers className="h-3.5 w-3.5 text-indigo-600" />
              CHƯƠNG TRÌNH TRỌNG TÂM
            </span>
            <h2 className="mt-3 font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Lộ trình bài bản theo từng khối (Lớp 1–5)
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Grade 1 */}
            <div className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-xs">
              <div className="inline-flex items-center justify-center rounded-xl bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                Lớp 1
              </div>
              <h3 className="mt-3 font-heading text-base font-bold text-slate-900">
                Làm quen Toán Tư Duy
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" /> Đếm hình & quan sát hình học</li>
                <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" /> Quy luật dãy số & hình ảnh</li>
                <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" /> So sánh chiều dài, khối lượng</li>
                <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" /> Tư duy định hướng không gian</li>
              </ul>
            </div>

            {/* Grade 2 */}
            <div className="rounded-3xl border-2 border-indigo-200 bg-white p-5 shadow-xs">
              <div className="inline-flex items-center justify-center rounded-xl bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">
                Lớp 2
              </div>
              <h3 className="mt-3 font-heading text-base font-bold text-slate-900">
                Xây Dựng Nền Tảng
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" /> Phép tính nhanh & cộng trừ có nhớ</li>
                <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" /> Bài toán suy luận logic cơ bản</li>
                <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" /> Thời gian, ngày tháng & lịch</li>
                <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" /> Ghép hình & đối xứng gương</li>
              </ul>
            </div>

            {/* Grade 3 */}
            <div className="rounded-3xl border-2 border-amber-200 bg-white p-5 shadow-xs">
              <div className="inline-flex items-center justify-center rounded-xl bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
                Lớp 3
              </div>
              <h3 className="mt-3 font-heading text-base font-bold text-slate-900">
                Phát Triển Tư Duy Sâu
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" /> Nhân chia số tự nhiên & cấu tạo số</li>
                <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" /> Chu vi, diện tích hình chữ nhật/vuông</li>
                <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" /> Bài toán trồng cây, tính tuổi</li>
                <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" /> Nguyên lý Dirichlet đơn giản</li>
              </ul>
            </div>

            {/* Grade 4 */}
            <div className="rounded-3xl border-2 border-emerald-200 bg-white p-5 shadow-xs">
              <div className="inline-flex items-center justify-center rounded-xl bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                Lớp 4
              </div>
              <h3 className="mt-3 font-heading text-base font-bold text-slate-900">
                Tăng Tốc Olympic
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" /> Dãy số cách đều & chữ số tận cùng</li>
                <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" /> Phân số & các phép toán phân số</li>
                <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" /> Bài toán tổng - tỉ, hiệu - tỉ</li>
                <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" /> Tổ hợp đếm & quy tắc cộng/nhân</li>
              </ul>
            </div>

            {/* Grade 5 */}
            <div className="rounded-3xl border-2 border-pink-200 bg-white p-5 shadow-xs">
              <div className="inline-flex items-center justify-center rounded-xl bg-pink-100 px-3 py-1 text-xs font-black text-pink-800">
                Lớp 5
              </div>
              <h3 className="mt-3 font-heading text-base font-bold text-slate-900">
                Chinh Phục Đỉnh Cao
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-pink-600 shrink-0 mt-0.5" /> Số học nâng cao & dấu hiệu chia hết</li>
                <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-pink-600 shrink-0 mt-0.5" /> Bài toán chuyển động đều nâng cao</li>
                <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-pink-600 shrink-0 mt-0.5" /> Tỉ số diện tích tam giác & hình tròn</li>
                <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-pink-600 shrink-0 mt-0.5" /> Luyện trọn bộ đề thi quốc tế</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3.5 py-1.5 text-xs font-extrabold text-yellow-800">
              <Star className="h-3.5 w-3.5 text-yellow-600 fill-current" />
              ĐÁNH GIÁ TỪ PHỤ HUYNH
            </span>
            <h2 className="mt-3 font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Học sinh & Phụ huynh nói gì về Mathiz?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Những trải nghiệm thực tế từ các gia đình có con theo đuổi các giải thưởng Toán học.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="tactile-card rounded-3xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-700 italic">
                  &ldquo;Bé nhà mình học lớp 2, lúc trước rất sợ làm đề thi vì chữ nhiều. Từ khi luyện trên Mathiz với bảng nháp iPad, con tự giác vẽ hình và tính toán hào hứng hẳn. Vừa rồi con vừa đạt giải Bạc TIMO vòng quốc gia!&rdquo;
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 border-t border-slate-200/80 pt-4">
                <div className="h-10 w-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center font-heading text-sm">
                  TH
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Chị Thu Hằng</div>
                  <div className="text-[11px] text-slate-500">Phụ huynh bé Gia Bảo (Lớp 2, Hà Nội)</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="tactile-card rounded-3xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-700 italic">
                  &ldquo;Giao diện Mathiz cực kỳ sạch sẽ, không hề có quảng cáo hay trò chơi gây xao nhãng. Thích nhất là nộp bài xong có ngay lời giải chi tiết và công thức rõ ràng, giúp bố mẹ dễ dàng đồng hành cùng con.&rdquo;
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 border-t border-slate-200/80 pt-4">
                <div className="h-10 w-10 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center font-heading text-sm">
                  NM
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Anh Nhật Minh</div>
                  <div className="text-[11px] text-slate-500">Phụ huynh bé Minh Khang (Lớp 4, TP.HCM)</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="tactile-card rounded-3xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-700 italic">
                  &ldquo;Bàn phím số to rõ rất phù hợp với tay trẻ em, phím tắt 1-4 trên laptop cũng rất tiện. Các đề thi Kangaroo và SASMO có chất lượng biên soạn rất chuẩn, con làm đi làm lại nhiều lần không chán.&rdquo;
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 border-t border-slate-200/80 pt-4">
                <div className="h-10 w-10 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center font-heading text-sm">
                  LA
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Chị Lan Anh</div>
                  <div className="text-[11px] text-slate-500">Giáo viên CLB Toán Tuổi Thơ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section id="faq" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3.5 py-1.5 text-xs font-extrabold text-blue-800">
              <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
              CÂU HỎI THƯỜNG GẶP
            </span>
            <h2 className="mt-3 font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Giải đáp thắc mắc về Mathiz
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {/* FAQ 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-xs font-black text-blue-700">Q1</span>
                Bé dùng iPad không có bút Apple Pencil thì có làm bài được không?
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600 pl-8">
                Hoàn toàn được! Bảng nháp của Mathiz nhận diện cử chỉ mượt mà bằng cả ngón tay và bất kỳ loại bút cảm ứng nào. Nếu làm trên máy tính, bé cũng có thể dùng chuột hoặc nháp ngoài giấy.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-xs font-black text-amber-800">Q2</span>
                Đăng ký tài khoản cho bé có phức tạp không?
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600 pl-8">
                Cực kỳ đơn giản! Phụ huynh chỉ cần điền Số điện thoại, đặt mật khẩu và chọn Khối lớp của bé. Không cần xác minh email phức tạp, đăng ký xong là có thể vào thi ngay trong 30 giây.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-xs font-black text-emerald-800">Q3</span>
                Sau khi thi xong có xem lại được các câu làm sai và lời giải không?
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600 pl-8">
                Có! Hệ thống lưu lại toàn bộ lịch sử bài làm của học sinh. Bạn có thể xem lại từng câu hỏi, đáp án bé đã chọn, đáp án chuẩn và lời giải phân tích chi tiết bất cứ lúc nào.
              </p>
            </div>

            {/* FAQ 4 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-pink-100 text-xs font-black text-pink-800">Q4</span>
                Bộ đề thi trên Mathiz gồm những kỳ thi nào?
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600 pl-8">
                Mathiz tập trung vào các kỳ thi Toán Olympic quốc tế lớn nhất dành cho học sinh Tiểu học như TIMO, Kangaroo (IKMC), SASMO, HKIMO và ASMO từ Vòng Sơ loại đến Vòng Quốc gia và Quốc tế.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. HIGH-CONVERTING BOTTOM CTA BANNER */}
      <section className="relative overflow-hidden bg-slate-950 bg-gradient-to-b from-blue-950 via-indigo-950 to-slate-950 pt-14 pb-20 text-white sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-32">
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md">
            <Trophy className="h-4 w-4" /> Bắt đầu hành trình Olympic ngay hôm nay
          </div>

          <h2 className="mt-6 font-heading text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Sẵn sàng rèn luyện tư duy & gặt hái Huy chương Toán học?
          </h2>

          <p className="mt-4 text-base sm:text-lg text-blue-100 max-w-2xl mx-auto">
            Trải nghiệm miễn phí ngay bộ đề thi thật TIMO & Kangaroo. Không cần thẻ ngân hàng, khởi đầu chỉ trong 30 giây!
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login?mode=register"
              className="tactile-btn tactile-btn-amber flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-amber-400 px-8 py-4 font-heading text-base font-black text-slate-950 hover:bg-amber-300 shadow-2xl"
            >
              <Sparkles className="h-5 w-5 text-slate-950" />
              <span>Tạo tài khoản học sinh miễn phí</span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/student/exams"
              className="tactile-btn tactile-btn-white flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 px-7 py-4 font-heading text-base font-bold text-white backdrop-blur-md hover:bg-white/20"
            >
              <BookOpen className="h-5 w-5" />
              <span>Xem danh sách đề thi</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-12 text-slate-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-heading text-lg font-black text-white shadow-sm">
                  M
                </div>
                <span className="font-heading text-xl font-black text-slate-900">Mathiz</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500 max-w-sm">
                Nền tảng luyện thi Toán Olympic chuẩn quốc tế dành cho học sinh Tiểu học Lớp 1–5. Tối ưu trải nghiệm làm bài trên iPad, bảng nháp cảm ứng và hệ thống phân tích lời giải chi tiết.
              </p>
              <div className="pt-2 text-xs font-semibold text-slate-400">
                Sử dụng font chữ chuẩn quốc gia <strong>Be Vietnam Pro</strong>.
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-heading text-xs font-extrabold tracking-wider uppercase text-slate-900">
                Điều hướng nhanh
              </h4>
              <ul className="mt-3 space-y-2 text-xs">
                <li>
                  <Link href="/login" className="hover:text-blue-600 transition">
                    Đăng nhập tài khoản
                  </Link>
                </li>
                <li>
                  <Link href="/login?mode=register" className="hover:text-blue-600 transition">
                    Đăng ký học sinh mới
                  </Link>
                </li>
                <li>
                  <Link href="/student/exams" className="hover:text-blue-600 transition">
                    Sảnh đề thi (Exam Lobby)
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-blue-600 transition">
                    Cổng Quản trị (Admin)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Competitions */}
            <div>
              <h4 className="font-heading text-xs font-extrabold tracking-wider uppercase text-slate-900">
                Kỳ thi tiêu biểu
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-slate-500">
                <li>TIMO (Thái Lan)</li>
                <li>IKMC (Kangaroo Quốc Tế)</li>
                <li>SASMO (Singapore)</li>
                <li>HKIMO (Hồng Kông)</li>
                <li>ASMO (Châu Á)</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
            <p>© 2026 Mathiz • Nền tảng Luyện thi Toán Olympic Tiểu học. All rights reserved.</p>
            <p className="mt-2 sm:mt-0">Tối ưu cho iPad, Tablet & Laptop.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
