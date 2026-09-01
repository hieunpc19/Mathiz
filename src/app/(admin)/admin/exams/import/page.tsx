"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  FileArchive,
  FileCheck,
  FolderOpen,
  GraduationCap,
  LoaderCircle,
  PencilLine,
} from "lucide-react";

type ExamPackage = {
  fileName: string;
  sizeBytes: number;
  modifiedAt: string;
  packageId: string;
  title: string;
  competition: string;
  round: string | null;
  schoolYear: string | null;
  languages: string[];
  questionCount: number;
  maxScore: number;
  assetCount: number;
};

type ImportResult = {
  examId: string;
  versionId: string;
  versionNo: number;
  questionCount: number;
  reused: boolean;
};

export default function AdminImportExamPage() {
  const [packages, setPackages] = useState<ExamPackage[]>([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [gradeMin, setGradeMin] = useState(1);
  const [gradeMax, setGradeMax] = useState(5);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/admin/exams/import", {
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok)
          throw new Error(
            payload.error?.message ?? "Không thể đọc kho gói đề.",
          );
        setPackages(payload.data.packages);
        setSelectedFile(payload.data.packages[0]?.fileName ?? "");
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : "Không thể đọc kho gói đề.",
        );
      } finally {
        setLoadingPackages(false);
      }
    })();
  }, []);

  const selectedPackage =
    packages.find((item) => item.fileName === selectedFile) ?? null;

  async function importPackage() {
    if (!selectedFile) return;
    setImporting(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/admin/exams/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageFile: selectedFile,
          durationMinutes,
          gradeMin,
          gradeMax,
        }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error?.message ?? "Không thể import gói đề.");
      setResult(payload.data);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không thể import gói đề.",
      );
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/exams"
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Quản lý đề thi
        </Link>
        <span className="text-xs font-bold text-slate-400">
          / Import từ kho ZIP
        </span>
      </div>

      <div className="mt-7">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">
          Quy trình tạo đề
        </p>
        <h1 className="mt-2 font-heading text-3xl font-black text-slate-950">
          Chọn gói, cấu hình và tạo bản nháp
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Hệ thống chỉ đọc các ZIP chuẩn trong thư mục{" "}
          <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs">
            data/
          </code>
          . Mỗi lần import luôn tạo một version nháp mới và không tác động đề
          đang phục vụ học sinh.
        </p>
      </div>

      <ol
        className="mt-7 grid gap-3 sm:grid-cols-3"
        aria-label="Các bước import"
      >
        {[
          ["1", "Chọn gói ZIP", FolderOpen],
          ["2", "Đặt thời gian & khối", Clock],
          ["3", "Biên tập & xuất bản", PencilLine],
        ].map(([number, label, Icon]) => (
          <li
            key={String(number)}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-800"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              {String(number)}
            </span>
            <Icon className="h-4 w-4 text-blue-600" aria-hidden="true" />{" "}
            {String(label)}
          </li>
        ))}
      </ol>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800"
        >
          {error}
        </div>
      )}

      {result ? (
        <section className="mt-7 rounded-3xl border-2 border-emerald-300 bg-emerald-50 p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <Check className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-heading text-xl font-black text-emerald-950">
                  Đã tạo bản nháp v{result.versionNo}
                </h2>
                <p className="mt-1 text-sm text-emerald-800">
                  {result.questionCount} câu hỏi đã sẵn sàng để kiểm tra và
                  chỉnh sửa.{" "}
                  {result.reused
                    ? "Gói này từng được import; bản nháp cũ vẫn được giữ nguyên."
                    : "Đây là lần import đầu tiên của gói."}
                </p>
              </div>
            </div>
            <Link
              href={`/admin/exams/${result.examId}/versions/${result.versionId}`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 text-sm font-extrabold text-white shadow-md hover:bg-emerald-800"
            >
              Mở trình biên tập{" "}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      ) : (
        <div className="mt-7 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-heading text-lg font-black text-slate-950">
                  1. Gói đề trong kho
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Chọn một file để xem manifest đã xác thực.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {packages.length} gói
              </span>
            </div>
            {loadingPackages ? (
              <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-slate-500">
                <LoaderCircle className="h-5 w-5 animate-spin" /> Đang quét thư
                mục data...
              </div>
            ) : packages.length === 0 ? (
              <div className="my-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                Chưa có file ZIP chuẩn trong thư mục data.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {packages.map((item) => {
                  const selected = item.fileName === selectedFile;
                  return (
                    <button
                      key={item.fileName}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSelectedFile(item.fileName)}
                      className={`flex min-h-20 w-full items-start gap-4 rounded-2xl border-2 p-4 text-left transition ${selected ? "border-blue-500 bg-blue-50 ring-4 ring-blue-100" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"}`}
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}
                      >
                        <FileArchive className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-sm text-slate-950">
                          {item.title}
                        </strong>
                        <span className="mt-1 block truncate font-mono text-[11px] text-slate-500">
                          {item.fileName}
                        </span>
                        <span className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
                          <span>{item.questionCount} câu</span>
                          <span>•</span>
                          <span>{item.assetCount} ảnh</span>
                          <span>•</span>
                          <span>
                            {item.languages.join(" + ").toUpperCase()}
                          </span>
                        </span>
                      </span>
                      {selected && (
                        <Check
                          className="h-5 w-5 shrink-0 text-blue-600"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
            <h2 className="font-heading text-lg font-black text-slate-950">
              2. Cấu hình bản nháp
            </h2>
            {selectedPackage && (
              <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white">
                <p className="text-xs font-bold text-amber-300">
                  {selectedPackage.competition} • {selectedPackage.schoolYear}
                </p>
                <p className="mt-2 text-sm font-extrabold leading-5">
                  {selectedPackage.title}
                </p>
                <p className="mt-2 text-xs text-slate-300">
                  Tối đa {selectedPackage.maxScore} điểm
                </p>
              </div>
            )}
            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Clock className="h-4 w-4 text-blue-600" aria-hidden="true" />{" "}
                  Thời gian làm bài
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={600}
                    value={durationMinutes}
                    onChange={(event) =>
                      setDurationMinutes(Number(event.target.value))
                    }
                    className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                  <span className="text-xs font-bold text-slate-500">phút</span>
                </div>
              </label>
              <fieldset>
                <legend className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <GraduationCap
                    className="h-4 w-4 text-blue-600"
                    aria-hidden="true"
                  />{" "}
                  Khối lớp
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <label className="text-[11px] text-slate-500">
                    Từ lớp
                    <select
                      value={gradeMin}
                      onChange={(event) =>
                        setGradeMin(Number(event.target.value))
                      }
                      className="mt-1 min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-900"
                    >
                      {Array.from({ length: 12 }, (_, index) => index + 1).map(
                        (grade) => (
                          <option key={grade}>{grade}</option>
                        ),
                      )}
                    </select>
                  </label>
                  <label className="text-[11px] text-slate-500">
                    Đến lớp
                    <select
                      value={gradeMax}
                      onChange={(event) =>
                        setGradeMax(Number(event.target.value))
                      }
                      className="mt-1 min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-900"
                    >
                      {Array.from({ length: 12 }, (_, index) => index + 1).map(
                        (grade) => (
                          <option key={grade}>{grade}</option>
                        ),
                      )}
                    </select>
                  </label>
                </div>
              </fieldset>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
                <strong>Không xuất bản ngay.</strong> Sau import, admin phải mở
                editor, kiểm tra validation và chủ động xuất bản version.
              </div>
              <button
                type="button"
                disabled={!selectedFile || importing || gradeMin > gradeMax}
                onClick={() => void importPackage()}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-extrabold text-white shadow-md hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {importing ? (
                  <LoaderCircle
                    className="h-5 w-5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <FileCheck className="h-5 w-5" aria-hidden="true" />
                )}
                {importing
                  ? "Đang tạo bản nháp..."
                  : "Import thành bản nháp mới"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
