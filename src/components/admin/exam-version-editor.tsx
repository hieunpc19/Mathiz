"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Copy,
  FileImage,
  LoaderCircle,
  Plus,
  Save,
  Send,
  Settings2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { MathRenderer } from "@/components/math/math-renderer";

type Option = { id: string; label: string; text: string };
type Question = {
  id: string;
  position: number;
  code: string;
  points: number;
  category: string;
  bodyMd: string;
  options: Option[];
  correctAnswer: string;
  explanationMd: string;
};
type Asset = {
  id: string;
  original_name: string;
  mime_type: string;
  url: string;
};
type Metadata = {
  title: string;
  competition: string;
  round: string | null;
  schoolYear: string | null;
  gradeMin: number;
  gradeMax: number;
  languages: string[];
  rightsNote: string | null;
};
type EditorData = {
  examId: string;
  currentVersionId: string | null;
  version: {
    id: string;
    versionNo: number;
    durationMinutes: number;
    lifecycle: "draft" | "published";
    publishedAt: string | null;
    metadata: Metadata;
  };
  questions: Question[];
  assets: Asset[];
};
type PublishIssue = { field: string; message: string; questionId?: string };

function questionErrors(question: Question) {
  const errors: Record<string, string> = {};
  if (!question.bodyMd.trim())
    errors.bodyMd = "Nội dung câu hỏi không được để trống.";
  if (!Number.isFinite(question.points) || question.points <= 0)
    errors.points = "Điểm phải lớn hơn 0.";
  if (question.options.length < 2) errors.options = "Cần ít nhất hai lựa chọn.";
  if (question.options.some((option) => !option.text.trim()))
    errors.options = "Mọi lựa chọn phải có nội dung.";
  if (!question.options.some((option) => option.id === question.correctAnswer))
    errors.correctAnswer = "Hãy chọn một đáp án đúng.";
  return errors;
}

export function ExamVersionEditor({
  examId,
  versionId,
}: {
  examId: string;
  versionId: string;
}) {
  const [editor, setEditor] = useState<EditorData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftQuestion, setDraftQuestion] = useState<Question | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [publishIssues, setPublishIssues] = useState<PublishIssue[]>([]);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const load = useCallback(
    async (preferredQuestionId?: string) => {
      const response = await fetch(
        `/api/admin/exams/${examId}/versions/${versionId}`,
        { cache: "no-store" },
      );
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error?.message ?? "Không thể tải bản nháp.");
      const next = payload.data.editor as EditorData;
      setEditor(next);
      setMetadata(next.version.metadata);
      setDurationMinutes(next.version.durationMinutes);
      const nextId =
        preferredQuestionId &&
        next.questions.some((question) => question.id === preferredQuestionId)
          ? preferredQuestionId
          : (next.questions[0]?.id ?? null);
      setSelectedId(nextId);
      setDraftQuestion(
        next.questions.find((question) => question.id === nextId) ?? null,
      );
      setDirty(false);
    },
    [examId, versionId],
  );

  useEffect(() => {
    let ignore = false;
    async function initialLoad() {
      try {
        await load();
      } catch (cause) {
        if (!ignore)
          setError(
            cause instanceof Error ? cause.message : "Không thể tải bản nháp.",
          );
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    void initialLoad();
    return () => {
      ignore = true;
    };
  }, [load]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const readonly = editor?.version.lifecycle === "published";
  const errors = useMemo(
    () => (draftQuestion ? questionErrors(draftQuestion) : {}),
    [draftQuestion],
  );
  const assetUrlByName = useMemo(
    () =>
      new Map(
        (editor?.assets ?? []).map((asset) => [asset.original_name, asset.url]),
      ),
    [editor?.assets],
  );
  const previewMarkdown = useCallback(
    (value: string) =>
      value.replace(/\]\(assets\/([^)]+)\)/g, (match, name: string) => {
        const url = assetUrlByName.get(name);
        return url ? `](${url})` : match;
      }),
    [assetUrlByName],
  );

  function selectQuestion(question: Question) {
    if (
      dirty &&
      !window.confirm(
        "Câu hiện tại có thay đổi chưa lưu. Bạn vẫn muốn chuyển câu?",
      )
    )
      return;
    setSelectedId(question.id);
    setDraftQuestion(structuredClone(question));
    setDirty(false);
    setError(null);
  }

  function updateQuestion(update: Partial<Question>) {
    setDraftQuestion((current) =>
      current ? { ...current, ...update } : current,
    );
    setDirty(true);
    setSuccess(null);
  }

  async function saveQuestion() {
    if (!draftQuestion) return false;
    if (Object.keys(errors).length) {
      setError("Vui lòng sửa các trường được đánh dấu trước khi lưu.");
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return false;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/exams/${examId}/versions/${versionId}/questions/${draftQuestion.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draftQuestion),
        },
      );
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error?.message ?? "Không thể lưu câu hỏi.");
      await load(draftQuestion.id);
      setSuccess(`Đã lưu câu ${draftQuestion.position}.`);
      return true;
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không thể lưu câu hỏi.",
      );
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveMetadata() {
    if (!metadata) return;
    if (dirty && !(await saveQuestion())) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/exams/${examId}/versions/${versionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata, durationMinutes }),
        },
      );
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error?.message ?? "Không thể lưu cấu hình.");
      await load(selectedId ?? undefined);
      setSuccess("Đã lưu cấu hình phiên bản.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không thể lưu cấu hình.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function createQuestion(source?: Question) {
    if (dirty && !(await saveQuestion())) return;
    const input = source
      ? { ...source, bodyMd: `${source.bodyMd}\n\n**Bản sao**` }
      : {
          bodyMd: "**EN:** New question\n\n**VI:** Câu hỏi mới",
          category: "logical-thinking",
          points: 4,
          options: ["A", "B", "C", "D"].map((id) => ({
            id,
            label: id,
            text: `Lựa chọn ${id}`,
          })),
          correctAnswer: "A",
          explanationMd: "",
        };
    setSaving(true);
    try {
      const response = await fetch(
        `/api/admin/exams/${examId}/versions/${versionId}/questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error?.message ?? "Không thể tạo câu hỏi.");
      await load(payload.data.questionId);
      setSuccess(source ? "Đã nhân bản câu hỏi." : "Đã thêm câu hỏi mới.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không thể tạo câu hỏi.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuestion() {
    if (
      !draftQuestion ||
      !window.confirm(
        `Xóa câu ${draftQuestion.position}? Thao tác này không thể hoàn tác.`,
      )
    )
      return;
    setSaving(true);
    try {
      const response = await fetch(
        `/api/admin/exams/${examId}/versions/${versionId}/questions/${draftQuestion.id}`,
        { method: "DELETE" },
      );
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error?.message ?? "Không thể xóa câu hỏi.");
      await load();
      setSuccess("Đã xóa câu hỏi.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không thể xóa câu hỏi.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function moveQuestion(direction: -1 | 1) {
    if (!editor || !selectedId) return;
    if (dirty && !(await saveQuestion())) return;
    const index = editor.questions.findIndex(
      (question) => question.id === selectedId,
    );
    const target = index + direction;
    if (target < 0 || target >= editor.questions.length) return;
    const orderedIds = editor.questions.map((question) => question.id);
    [orderedIds[index], orderedIds[target]] = [
      orderedIds[target],
      orderedIds[index],
    ];
    const response = await fetch(
      `/api/admin/exams/${examId}/versions/${versionId}/questions`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      },
    );
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error?.message ?? "Không thể sắp xếp câu hỏi.");
      return;
    }
    await load(selectedId);
  }

  async function uploadAsset(file: File) {
    if (dirty && !(await saveQuestion())) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch(
        `/api/admin/exams/${examId}/versions/${versionId}/assets`,
        { method: "POST", body: formData },
      );
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error?.message ?? "Không thể tải ảnh lên.");
      await load(selectedId ?? undefined);
      setSuccess(`Đã tải ảnh ${payload.data.asset.original_name}.`);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không thể tải ảnh lên.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function deleteAsset(asset: Asset) {
    if (
      !window.confirm(
        `Xóa ảnh ${asset.original_name}? Các câu đang tham chiếu ảnh sẽ không thể xuất bản.`,
      )
    )
      return;
    if (dirty && !(await saveQuestion())) return;
    const response = await fetch(
      `/api/admin/exams/${examId}/versions/${versionId}/assets/${asset.id}`,
      { method: "DELETE" },
    );
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error?.message ?? "Không thể xóa ảnh.");
      return;
    }
    await load(selectedId ?? undefined);
  }

  async function publish() {
    if (dirty && !(await saveQuestion())) return;
    setPublishing(true);
    setError(null);
    setPublishIssues([]);
    try {
      const response = await fetch(
        `/api/admin/exams/${examId}/versions/${versionId}/publish`,
        { method: "POST" },
      );
      const payload = await response.json();
      if (!response.ok) {
        if (payload.error?.issues) {
          setPublishIssues(payload.error.issues);
          requestAnimationFrame(() => errorSummaryRef.current?.focus());
        }
        throw new Error(payload.error?.message ?? "Không thể xuất bản.");
      }
      await load(selectedId ?? undefined);
      setSuccess("Phiên bản đã được xuất bản và đang phục vụ học sinh.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xuất bản.");
    } finally {
      setPublishing(false);
    }
  }

  if (loading)
    return (
      <div className="flex min-h-[70vh] items-center justify-center gap-3 text-sm font-semibold text-slate-500">
        <LoaderCircle className="h-7 w-7 animate-spin text-blue-600" /> Đang mở
        trình biên tập...
      </div>
    );
  if (!editor || !metadata)
    return (
      <div className="mx-auto max-w-3xl p-10 text-center text-rose-700">
        {error ?? "Không tìm thấy phiên bản đề."}
      </div>
    );

  return (
    <div className="mx-auto max-w-[1600px] px-3 pb-16 pt-4 sm:px-5 lg:px-7">
      <header className="sticky top-0 z-30 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur-md sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={`/admin/exams/${examId}`}
              aria-label="Quay lại đề thi"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate font-heading text-lg font-black text-slate-950">
                  {metadata.title}
                </h1>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${readonly ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
                >
                  v{editor.version.versionNo} •{" "}
                  {readonly ? "ĐÃ XUẤT BẢN" : "BẢN NHÁP"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {editor.questions.length} câu •{" "}
                {editor.questions.reduce(
                  (sum, question) => sum + question.points,
                  0,
                )}{" "}
                điểm • {durationMinutes} phút
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-expanded={settingsOpen}
              onClick={() => setSettingsOpen((value) => !value)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Settings2 className="h-4 w-4" /> Cấu hình{" "}
              {settingsOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {!readonly && (
              <button
                type="button"
                disabled={publishing || saving}
                onClick={() => void publish()}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-extrabold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
              >
                {publishing ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}{" "}
                Xuất bản version
              </button>
            )}
          </div>
        </div>
        {settingsOpen && (
          <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-6">
            <label className="lg:col-span-2 text-[11px] font-bold text-slate-600">
              Tên đề
              <input
                disabled={readonly}
                value={metadata.title}
                onChange={(event) =>
                  setMetadata({ ...metadata, title: event.target.value })
                }
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold disabled:bg-slate-100"
              />
            </label>
            <label className="text-[11px] font-bold text-slate-600">
              Kỳ thi
              <input
                disabled={readonly}
                value={metadata.competition}
                onChange={(event) =>
                  setMetadata({ ...metadata, competition: event.target.value })
                }
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold disabled:bg-slate-100"
              />
            </label>
            <label className="text-[11px] font-bold text-slate-600">
              Thời gian
              <input
                disabled={readonly}
                type="number"
                min={1}
                max={600}
                value={durationMinutes}
                onChange={(event) =>
                  setDurationMinutes(Number(event.target.value))
                }
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold disabled:bg-slate-100"
              />
            </label>
            <label className="text-[11px] font-bold text-slate-600">
              Từ lớp
              <select
                disabled={readonly}
                value={metadata.gradeMin}
                onChange={(event) =>
                  setMetadata({
                    ...metadata,
                    gradeMin: Number(event.target.value),
                  })
                }
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold disabled:bg-slate-100"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                  <option key={grade}>{grade}</option>
                ))}
              </select>
            </label>
            <label className="text-[11px] font-bold text-slate-600">
              Đến lớp
              <select
                disabled={readonly}
                value={metadata.gradeMax}
                onChange={(event) =>
                  setMetadata({
                    ...metadata,
                    gradeMax: Number(event.target.value),
                  })
                }
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold disabled:bg-slate-100"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                  <option key={grade}>{grade}</option>
                ))}
              </select>
            </label>
            {!readonly && (
              <div className="flex items-end lg:col-start-6">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveMetadata()}
                  className="min-h-11 w-full rounded-xl bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Lưu cấu hình
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {(error || publishIssues.length > 0) && (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 outline-none focus:ring-4 focus:ring-rose-100"
        >
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <div>
              <p className="text-sm font-extrabold text-rose-900">{error}</p>
              {publishIssues.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-rose-800">
                  {publishIssues.map((issue, index) => (
                    <li key={`${issue.field}-${index}`}>
                      <button
                        type="button"
                        className="text-left underline"
                        onClick={() => {
                          const question = editor.questions.find(
                            (item) => item.id === issue.questionId,
                          );
                          if (question) selectQuestion(question);
                        }}
                      >
                        {issue.message}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
      {success && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
          <Check className="h-4 w-4" /> {success}
          <button
            type="button"
            aria-label="Đóng thông báo"
            onClick={() => setSuccess(null)}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg hover:bg-emerald-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)_minmax(320px,0.85fr)]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              Câu hỏi
            </h2>
            {!readonly && (
              <button
                type="button"
                aria-label="Thêm câu hỏi"
                onClick={() => void createQuestion()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2 lg:grid-cols-2">
            {editor.questions.map((question) => (
              <button
                key={question.id}
                type="button"
                aria-current={question.id === selectedId ? "true" : undefined}
                onClick={() => selectQuestion(question)}
                className={`min-h-11 rounded-xl border text-xs font-bold ${question.id === selectedId ? "border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-100" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
              >
                Câu {question.position}
              </button>
            ))}
          </div>
          {!readonly && draftQuestion && (
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => void moveQuestion(-1)}
                className="flex min-h-10 items-center justify-center gap-1 rounded-xl border border-slate-200 text-xs font-bold"
              >
                <ArrowUp className="h-3.5 w-3.5" /> Lên
              </button>
              <button
                type="button"
                onClick={() => void moveQuestion(1)}
                className="flex min-h-10 items-center justify-center gap-1 rounded-xl border border-slate-200 text-xs font-bold"
              >
                <ArrowDown className="h-3.5 w-3.5" /> Xuống
              </button>
            </div>
          )}
        </aside>

        <main className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
          {draftQuestion ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-blue-600">
                    CÂU {draftQuestion.position}
                  </p>
                  <h2 className="font-heading text-xl font-black text-slate-950">
                    Nội dung và đáp án
                  </h2>
                </div>
                {!readonly && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void createQuestion(draftQuestion)}
                      className="flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700"
                    >
                      <Copy className="h-4 w-4" /> Nhân bản
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteQuestion()}
                      className="flex min-h-10 items-center gap-1.5 rounded-xl border border-rose-200 px-3 text-xs font-bold text-rose-700"
                    >
                      <Trash2 className="h-4 w-4" /> Xóa
                    </button>
                  </div>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                <label className="text-xs font-bold text-slate-700">
                  Danh mục
                  <input
                    disabled={readonly}
                    value={draftQuestion.category}
                    onChange={(event) =>
                      updateQuestion({ category: event.target.value })
                    }
                    className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm disabled:bg-slate-100"
                  />
                </label>
                <label className="text-xs font-bold text-slate-700">
                  Điểm
                  <input
                    disabled={readonly}
                    type="number"
                    min={0.1}
                    step={0.5}
                    value={draftQuestion.points}
                    onChange={(event) =>
                      updateQuestion({ points: Number(event.target.value) })
                    }
                    className={`mt-1 min-h-11 w-full rounded-xl border px-3 text-sm font-bold disabled:bg-slate-100 ${errors.points ? "border-rose-400" : "border-slate-200"}`}
                  />
                  {errors.points && (
                    <span className="mt-1 block text-[11px] text-rose-700">
                      {errors.points}
                    </span>
                  )}
                </label>
              </div>
              <label className="block text-xs font-bold text-slate-700">
                Nội dung Markdown/LaTeX
                <textarea
                  id="question-body"
                  disabled={readonly}
                  value={draftQuestion.bodyMd}
                  onChange={(event) =>
                    updateQuestion({ bodyMd: event.target.value })
                  }
                  rows={10}
                  className={`mt-1 w-full rounded-2xl border bg-slate-50 p-4 font-mono text-sm leading-6 outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 ${errors.bodyMd ? "border-rose-400" : "border-slate-200"}`}
                />
                {errors.bodyMd && (
                  <span className="mt-1 block text-[11px] text-rose-700">
                    {errors.bodyMd}
                  </span>
                )}
              </label>
              <fieldset>
                <legend className="text-xs font-bold text-slate-700">
                  Các lựa chọn và đáp án đúng
                </legend>
                <div className="mt-2 space-y-3">
                  {draftQuestion.options.map((option, index) => (
                    <div
                      key={`${option.id}-${index}`}
                      className={`flex items-start gap-3 rounded-2xl border p-3 ${draftQuestion.correctAnswer === option.id ? "border-emerald-400 bg-emerald-50" : "border-slate-200"}`}
                    >
                      <label className="mt-2 flex shrink-0 items-center gap-2 text-xs font-extrabold text-slate-700">
                        <input
                          disabled={readonly}
                          type="radio"
                          name="correct-answer"
                          checked={draftQuestion.correctAnswer === option.id}
                          onChange={() =>
                            updateQuestion({ correctAnswer: option.id })
                          }
                          className="h-4 w-4"
                        />
                        {option.id}
                      </label>
                      <textarea
                        disabled={readonly}
                        value={option.text}
                        onChange={(event) =>
                          updateQuestion({
                            options: draftQuestion.options.map(
                              (item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, text: event.target.value }
                                  : item,
                            ),
                          })
                        }
                        rows={2}
                        className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm disabled:bg-slate-100"
                      />
                      {!readonly && draftQuestion.options.length > 2 && (
                        <button
                          type="button"
                          aria-label={`Xóa lựa chọn ${option.id}`}
                          onClick={() => {
                            const next = draftQuestion.options
                              .filter((_, itemIndex) => itemIndex !== index)
                              .map((item, itemIndex) => ({
                                ...item,
                                id: String.fromCharCode(65 + itemIndex),
                                label: String.fromCharCode(65 + itemIndex),
                              }));
                            updateQuestion({
                              options: next,
                              correctAnswer: next.some(
                                (item) =>
                                  item.id === draftQuestion.correctAnswer,
                              )
                                ? draftQuestion.correctAnswer
                                : next[0].id,
                            });
                          }}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.options && (
                  <p className="mt-1 text-[11px] text-rose-700">
                    {errors.options}
                  </p>
                )}
                {!readonly && draftQuestion.options.length < 8 && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = String.fromCharCode(
                        65 + draftQuestion.options.length,
                      );
                      updateQuestion({
                        options: [
                          ...draftQuestion.options,
                          { id, label: id, text: "" },
                        ],
                      });
                    }}
                    className="mt-3 flex min-h-10 items-center gap-2 rounded-xl border border-dashed border-blue-300 px-3 text-xs font-bold text-blue-700"
                  >
                    <Plus className="h-4 w-4" /> Thêm lựa chọn
                  </button>
                )}
              </fieldset>
              <label className="block text-xs font-bold text-slate-700">
                Lời giải Markdown/LaTeX
                <textarea
                  disabled={readonly}
                  value={draftQuestion.explanationMd}
                  onChange={(event) =>
                    updateQuestion({ explanationMd: event.target.value })
                  }
                  rows={5}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 disabled:bg-slate-100"
                />
              </label>
              {!readonly && (
                <div className="sticky bottom-3 flex justify-end rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
                  <button
                    type="button"
                    disabled={saving || !dirty}
                    onClick={() => void saveQuestion()}
                    className="flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-extrabold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}{" "}
                    Lưu câu hỏi
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-sm text-slate-500">
              Chưa có câu hỏi. Hãy thêm câu đầu tiên.
            </div>
          )}
        </main>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              Xem trước học sinh
            </p>
            {draftQuestion ? (
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
                    {draftQuestion.position}
                  </span>
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold">
                    {draftQuestion.category}
                  </span>
                  <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                    +{draftQuestion.points} điểm
                  </span>
                </div>
                <MathRenderer
                  content={previewMarkdown(draftQuestion.bodyMd)}
                  className="mt-5 text-base"
                />
                <div className="mt-5 grid gap-2">
                  {draftQuestion.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-start gap-3 rounded-xl border-2 border-slate-200 p-3"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold">
                        {option.id}
                      </span>
                      <MathRenderer
                        content={previewMarkdown(option.text)}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Chọn một câu để xem trước.
              </p>
            )}
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                  Kho ảnh
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  PNG, JPEG, WebP • tối đa 5 MB
                </p>
              </div>
              {!readonly && (
                <label
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                  aria-label="Tải ảnh lên"
                >
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    disabled={uploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadAsset(file);
                      event.target.value = "";
                    }}
                  />
                  {uploading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </label>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {editor.assets.map((asset) => (
                <div
                  key={asset.id}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                >
                  <div className="aspect-video bg-white p-2">
                    <Image
                      unoptimized
                      src={asset.url}
                      alt={asset.original_name}
                      width={320}
                      height={180}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="p-2">
                    <p className="truncate text-[10px] font-semibold text-slate-600">
                      {asset.original_name}
                    </p>
                    {!readonly && (
                      <div className="mt-2 flex gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            draftQuestion &&
                            updateQuestion({
                              bodyMd: `${draftQuestion.bodyMd}\n\n![Mô tả ảnh](assets/${asset.original_name})`,
                            })
                          }
                          className="flex min-h-9 flex-1 items-center justify-center gap-1 rounded-lg bg-blue-50 text-[10px] font-bold text-blue-700"
                        >
                          <FileImage className="h-3 w-3" /> Chèn
                        </button>
                        <button
                          type="button"
                          aria-label={`Xóa ${asset.original_name}`}
                          onClick={() => void deleteAsset(asset)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {editor.assets.length === 0 && (
              <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-5 text-center text-xs text-slate-500">
                Chưa có ảnh trong version.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
