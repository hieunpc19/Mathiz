import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  AttemptExam,
  ExamDetail,
  ExamQuestion,
  ExamSummary,
  QuestionOption,
} from "@/lib/exams/types";

type ExamRow = {
  id: string;
  title: string;
  competition: string | null;
  round: string | null;
  school_year: string | null;
  grade_min: number | null;
  grade_max: number | null;
  languages: string[];
  status: "draft" | "published" | "archived";
  current_version_id: string | null;
};

type VersionRow = {
  id: string;
  duration_seconds: number | null;
  scoring_policy: Record<string, unknown>;
};

function textMetadata(
  metadata: Record<string, unknown>,
  key: string,
  fallback: string,
) {
  return typeof metadata[key] === "string"
    ? (metadata[key] as string)
    : fallback;
}

function numberMetadata(
  metadata: Record<string, unknown>,
  key: string,
  fallback: number,
) {
  return typeof metadata[key] === "number"
    ? (metadata[key] as number)
    : fallback;
}

function gradeLabel(min: number, max: number) {
  return min === max ? `Lớp ${min}` : `Lớp ${min}–${max}`;
}

export function mapExam(exam: ExamRow, version: VersionRow): ExamDetail {
  const metadata = version.scoring_policy ?? {};
  const versionExamMetadata =
    metadata.examMetadata && typeof metadata.examMetadata === "object"
      ? (metadata.examMetadata as Record<string, unknown>)
      : {};
  const gradeMin =
    typeof versionExamMetadata.gradeMin === "number"
      ? versionExamMetadata.gradeMin
      : (exam.grade_min ?? 1);
  const gradeMax =
    typeof versionExamMetadata.gradeMax === "number"
      ? versionExamMetadata.gradeMax
      : (exam.grade_max ?? gradeMin);
  return {
    id: exam.id,
    title:
      typeof versionExamMetadata.title === "string"
        ? versionExamMetadata.title
        : exam.title,
    subtitle: textMetadata(
      metadata,
      "subtitle",
      typeof versionExamMetadata.competition === "string"
        ? versionExamMetadata.competition
        : (exam.competition ?? "Đề Toán"),
    ),
    competition:
      typeof versionExamMetadata.competition === "string"
        ? versionExamMetadata.competition
        : (exam.competition ?? "TIMO"),
    grade: gradeMin,
    gradeMin,
    gradeMax,
    gradeLabel: gradeLabel(gradeMin, gradeMax),
    durationMinutes: Math.ceil((version.duration_seconds ?? 0) / 60),
    totalQuestions: numberMetadata(metadata, "questionCount", 0),
    totalPoints: numberMetadata(metadata, "maxScore", 0),
    difficulty: textMetadata(metadata, "difficulty", "Phù hợp tiểu học"),
    description: textMetadata(metadata, "description", "Đề thi Toán song ngữ."),
    status: exam.status,
    round:
      typeof versionExamMetadata.round === "string"
        ? versionExamMetadata.round
        : exam.round,
    schoolYear:
      typeof versionExamMetadata.schoolYear === "string"
        ? versionExamMetadata.schoolYear
        : exam.school_year,
    languages: Array.isArray(versionExamMetadata.languages)
      ? versionExamMetadata.languages.filter(
          (language): language is string => typeof language === "string",
        )
      : exam.languages,
    rules: Array.isArray(metadata.rules)
      ? metadata.rules.filter(
          (value): value is string => typeof value === "string",
        )
      : [],
  };
}

export async function getExamAndVersion(examId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: exam, error: examError } = await supabase
    .from("exams")
    .select(
      "id,title,competition,round,school_year,grade_min,grade_max,languages,status,current_version_id",
    )
    .eq("id", examId)
    .maybeSingle();
  if (examError) throw examError;
  if (!exam?.current_version_id) return null;

  const { data: version, error: versionError } = await supabase
    .from("exam_versions")
    .select("id,duration_seconds,scoring_policy")
    .eq("id", exam.current_version_id)
    .maybeSingle();
  if (versionError) throw versionError;
  if (!version) return null;
  return { exam: exam as ExamRow, version: version as VersionRow };
}

export async function listPublishedExams(): Promise<ExamSummary[]> {
  const supabase = createSupabaseAdminClient();
  const { data: exams, error } = await supabase
    .from("exams")
    .select(
      "id,title,competition,round,school_year,grade_min,grade_max,languages,status,current_version_id",
    )
    .eq("status", "published")
    .not("current_version_id", "is", null)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const results = await Promise.all(
    (exams ?? []).map(async (exam) => {
      const { data: version, error: versionError } = await supabase
        .from("exam_versions")
        .select("id,duration_seconds,scoring_policy")
        .eq("id", exam.current_version_id)
        .single();
      if (versionError) throw versionError;
      const detail = mapExam(exam as ExamRow, version as VersionRow);
      return {
        id: detail.id,
        title: detail.title,
        subtitle: detail.subtitle,
        competition: detail.competition,
        grade: detail.grade,
        gradeMin: detail.gradeMin,
        gradeMax: detail.gradeMax,
        gradeLabel: detail.gradeLabel,
        durationMinutes: detail.durationMinutes,
        totalQuestions: detail.totalQuestions,
        totalPoints: detail.totalPoints,
        difficulty: detail.difficulty,
        description: detail.description,
        status: detail.status,
      };
    }),
  );
  return results;
}

function assetUrl(examId: string, versionId: string, name: string) {
  return `/api/exams/${examId}/assets/${name
    .split("/")
    .map(encodeURIComponent)
    .join("/")}?versionId=${encodeURIComponent(versionId)}`;
}

function resolveAssets(markdown: string, examId: string, versionId: string) {
  return markdown.replace(
    /\]\(assets\/([^)]+)\)/g,
    (_match, name: string) => `](${assetUrl(examId, versionId, name)})`,
  );
}

function categoryLabel(category: string | null) {
  const labels: Record<string, string> = {
    "logical-thinking": "Tư duy lô-gic",
    arithmetic: "Số học",
    "number-theory": "Lý thuyết số",
    geometry: "Hình học",
    combinatorics: "Tổ hợp",
  };
  return labels[category ?? ""] ?? category ?? "Toán học";
}

export function mapQuestion(
  row: {
    id: string;
    position: number;
    code: string | null;
    category: string | null;
    body_md: string;
    options: unknown;
    points_correct: number | string;
  },
  examId: string,
  versionId: string,
): ExamQuestion {
  const options = Array.isArray(row.options)
    ? (row.options as QuestionOption[])
    : [];
  return {
    id: row.id,
    position: row.position,
    code: row.code ?? `q${row.position}`,
    type: "single_choice",
    points: Number(row.points_correct),
    category: categoryLabel(row.category),
    bodyMd: resolveAssets(row.body_md, examId, versionId),
    options: options.map((option) => ({
      ...option,
      text: resolveAssets(option.text, examId, versionId),
    })),
  };
}

export async function getAttemptExam(
  examId: string,
  versionId: string,
): Promise<AttemptExam | null> {
  const supabase = createSupabaseAdminClient();
  const { data: exam, error: examError } = await supabase
    .from("exams")
    .select(
      "id,title,competition,round,school_year,grade_min,grade_max,languages,status,current_version_id",
    )
    .eq("id", examId)
    .maybeSingle();
  if (examError) throw examError;
  const { data: version, error: versionError } = await supabase
    .from("exam_versions")
    .select("id,duration_seconds,scoring_policy")
    .eq("id", versionId)
    .eq("exam_id", examId)
    .maybeSingle();
  if (versionError) throw versionError;
  if (!exam || !version) return null;
  const { data: questions, error } = await supabase
    .from("questions")
    .select("id,position,code,category,body_md,options,points_correct")
    .eq("exam_version_id", versionId)
    .order("position");
  if (error) throw error;
  return {
    ...mapExam(exam as ExamRow, version as VersionRow),
    questions: (questions ?? []).map((question) =>
      mapQuestion(question, examId, versionId),
    ),
  };
}
