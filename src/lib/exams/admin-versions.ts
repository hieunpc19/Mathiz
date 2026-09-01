import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { decryptAnswer, encryptAnswer } from "@/lib/exams/answer-crypto";
import { mapQuestion } from "@/lib/exams/data";

const BUCKET = "exam-assets";

export type VersionMetadata = {
  title: string;
  competition: string;
  round: string | null;
  schoolYear: string | null;
  gradeMin: number;
  gradeMax: number;
  languages: string[];
  rightsNote: string | null;
};

export type PublishIssue = {
  field: string;
  message: string;
  questionId?: string;
};

type VersionRow = {
  id: string;
  exam_id: string;
  version_no: number;
  duration_seconds: number | null;
  scoring_policy: Record<string, unknown>;
  source_format: string;
  raw_source_path: string | null;
  compiled_hash: string | null;
  published_at: string | null;
  created_at: string;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function versionMetadata(
  exam: Record<string, unknown>,
  scoringPolicy: Record<string, unknown>,
): VersionMetadata {
  const metadata = record(scoringPolicy.examMetadata);
  return {
    title:
      typeof metadata.title === "string"
        ? metadata.title
        : String(exam.title ?? ""),
    competition:
      typeof metadata.competition === "string"
        ? metadata.competition
        : String(exam.competition ?? ""),
    round:
      typeof metadata.round === "string"
        ? metadata.round
        : typeof exam.round === "string"
          ? exam.round
          : null,
    schoolYear:
      typeof metadata.schoolYear === "string"
        ? metadata.schoolYear
        : typeof exam.school_year === "string"
          ? exam.school_year
          : null,
    gradeMin:
      typeof metadata.gradeMin === "number"
        ? metadata.gradeMin
        : Number(exam.grade_min ?? 1),
    gradeMax:
      typeof metadata.gradeMax === "number"
        ? metadata.gradeMax
        : Number(exam.grade_max ?? 5),
    languages: Array.isArray(metadata.languages)
      ? metadata.languages.filter(
          (item): item is string => typeof item === "string",
        )
      : Array.isArray(exam.languages)
        ? (exam.languages as string[])
        : ["vi"],
    rightsNote:
      typeof metadata.rightsNote === "string"
        ? metadata.rightsNote
        : typeof exam.rights_note === "string"
          ? exam.rights_note
          : null,
  };
}

export async function getVersion(examId: string, versionId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("exam_versions")
    .select(
      "id,exam_id,version_no,duration_seconds,scoring_policy,source_format,raw_source_path,compiled_hash,published_at,created_at",
    )
    .eq("id", versionId)
    .eq("exam_id", examId)
    .maybeSingle();
  if (error) throw error;
  return data as VersionRow | null;
}

export async function requireDraftVersion(examId: string, versionId: string) {
  const version = await getVersion(examId, versionId);
  if (!version) return { error: "not_found" as const };
  if (version.published_at) return { error: "immutable" as const };
  return { version };
}

export async function loadVersionEditor(examId: string, versionId: string) {
  const supabase = createSupabaseAdminClient();
  const [{ data: exam, error: examError }, version] = await Promise.all([
    supabase
      .from("exams")
      .select(
        "id,title,competition,round,school_year,grade_min,grade_max,languages,rights_note,status,current_version_id",
      )
      .eq("id", examId)
      .maybeSingle(),
    getVersion(examId, versionId),
  ]);
  if (examError) throw examError;
  if (!exam || !version) return null;

  const [
    { data: questionRows, error: questionError },
    { data: assets, error: assetError },
  ] = await Promise.all([
    supabase
      .from("questions")
      .select(
        "id,position,code,category,body_md,options,correct_key,points_correct,points_wrong,image_paths,tags,explanation_md",
      )
      .eq("exam_version_id", versionId)
      .order("position"),
    supabase
      .from("assets")
      .select("id,original_name,mime_type,storage_path,sha256,created_at")
      .eq("exam_version_id", versionId)
      .order("original_name"),
  ]);
  if (questionError) throw questionError;
  if (assetError) throw assetError;

  return {
    examId,
    currentVersionId: exam.current_version_id,
    version: {
      id: version.id,
      versionNo: version.version_no,
      durationMinutes: Math.ceil((version.duration_seconds ?? 0) / 60),
      lifecycle: version.published_at ? "published" : "draft",
      publishedAt: version.published_at,
      createdAt: version.created_at,
      metadata: versionMetadata(exam, version.scoring_policy),
      scoringPolicy: version.scoring_policy,
    },
    questions: (questionRows ?? []).map((question) => {
      const mapped = mapQuestion(question, examId, versionId);
      const options = Array.isArray(question.options)
        ? (question.options as Array<{
            id: string;
            label: string;
            text: string;
          }>)
        : [];
      return {
        ...mapped,
        category: question.category ?? "Toán học",
        bodyMd: question.body_md,
        options,
        correctAnswer: decryptAnswer(question.correct_key),
        pointsWrong: Number(question.points_wrong ?? 0),
        explanationMd: question.explanation_md ?? "",
        imagePaths: Array.isArray(question.image_paths)
          ? question.image_paths
          : [],
        tags: question.tags ?? [],
      };
    }),
    assets: (assets ?? []).map((asset) => ({
      ...asset,
      url: `/api/exams/${examId}/assets/${asset.original_name}?versionId=${versionId}`,
    })),
  };
}

function markdownAssets(markdown: string) {
  return Array.from(
    markdown.matchAll(/\]\(assets\/([^)]+)\)/g),
    (match) => match[1],
  );
}

export async function validateVersionForPublish(
  examId: string,
  versionId: string,
) {
  const editor = await loadVersionEditor(examId, versionId);
  if (!editor) return { editor: null, issues: [] as PublishIssue[] };
  const issues: PublishIssue[] = [];
  const { metadata, durationMinutes } = editor.version;
  if (!metadata.title.trim())
    issues.push({ field: "title", message: "Tên đề không được để trống." });
  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 1 ||
    durationMinutes > 600
  ) {
    issues.push({
      field: "durationMinutes",
      message: "Thời gian phải từ 1 đến 600 phút.",
    });
  }
  if (
    !Number.isInteger(metadata.gradeMin) ||
    !Number.isInteger(metadata.gradeMax) ||
    metadata.gradeMin < 1 ||
    metadata.gradeMax > 12 ||
    metadata.gradeMin > metadata.gradeMax
  ) {
    issues.push({ field: "grades", message: "Khoảng khối lớp không hợp lệ." });
  }
  if (!editor.questions.length) {
    issues.push({
      field: "questions",
      message: "Đề phải có ít nhất một câu hỏi.",
    });
  }
  const assetNames = new Set(editor.assets.map((asset) => asset.original_name));
  for (const question of editor.questions) {
    if (!question.bodyMd.trim()) {
      issues.push({
        field: "bodyMd",
        questionId: question.id,
        message: `Câu ${question.position} chưa có nội dung.`,
      });
    }
    if (!Number.isFinite(question.points) || question.points <= 0) {
      issues.push({
        field: "points",
        questionId: question.id,
        message: `Điểm câu ${question.position} phải lớn hơn 0.`,
      });
    }
    if (
      question.options.length < 2 ||
      question.options.some((option) => !option.text.trim())
    ) {
      issues.push({
        field: "options",
        questionId: question.id,
        message: `Câu ${question.position} cần ít nhất hai lựa chọn có nội dung.`,
      });
    }
    if (
      !question.options.some((option) => option.id === question.correctAnswer)
    ) {
      issues.push({
        field: "correctAnswer",
        questionId: question.id,
        message: `Đáp án đúng của câu ${question.position} không tồn tại.`,
      });
    }
    const references = markdownAssets(
      `${question.bodyMd}\n${question.explanationMd}\n${question.options.map((option) => option.text).join("\n")}`,
    );
    for (const assetName of references) {
      if (!assetNames.has(assetName)) {
        issues.push({
          field: "assets",
          questionId: question.id,
          message: `Câu ${question.position} tham chiếu ảnh không tồn tại: ${assetName}.`,
        });
      }
    }
  }
  return { editor, issues };
}

export async function refreshVersionTotals(versionId: string) {
  const supabase = createSupabaseAdminClient();
  const [
    { data: version, error: versionError },
    { data: questions, error: questionError },
  ] = await Promise.all([
    supabase
      .from("exam_versions")
      .select("scoring_policy")
      .eq("id", versionId)
      .single(),
    supabase
      .from("questions")
      .select("points_correct")
      .eq("exam_version_id", versionId),
  ]);
  if (versionError) throw versionError;
  if (questionError) throw questionError;
  const scoring = record(version.scoring_policy);
  const { error } = await supabase
    .from("exam_versions")
    .update({
      scoring_policy: {
        ...scoring,
        questionCount: questions?.length ?? 0,
        maxScore: (questions ?? []).reduce(
          (sum, question) => sum + Number(question.points_correct),
          0,
        ),
        lifecycleStatus: "draft",
      },
    })
    .eq("id", versionId);
  if (error) throw error;
}

export async function normalizeQuestionPositions(
  versionId: string,
  orderedIds: string[],
) {
  const supabase = createSupabaseAdminClient();
  for (let index = 0; index < orderedIds.length; index += 1) {
    const { error } = await supabase
      .from("questions")
      .update({ position: 10000 + index })
      .eq("id", orderedIds[index])
      .eq("exam_version_id", versionId);
    if (error) throw error;
  }
  for (let index = 0; index < orderedIds.length; index += 1) {
    const { error } = await supabase
      .from("questions")
      .update({ position: index + 1 })
      .eq("id", orderedIds[index])
      .eq("exam_version_id", versionId);
    if (error) throw error;
  }
}

export async function cloneVersion(
  examId: string,
  sourceVersionId: string,
  adminUserId: string,
) {
  const supabase = createSupabaseAdminClient();
  const source = await getVersion(examId, sourceVersionId);
  if (!source) throw new Error("Không tìm thấy phiên bản nguồn.");
  const { data: lastVersions, error: versionNoError } = await supabase
    .from("exam_versions")
    .select("version_no")
    .eq("exam_id", examId)
    .order("version_no", { ascending: false })
    .limit(1);
  if (versionNoError) throw versionNoError;
  const versionNo = (lastVersions?.[0]?.version_no ?? 0) + 1;
  const scoring = {
    ...record(source.scoring_policy),
    lifecycleStatus: "draft",
  };
  const { data: draft, error: draftError } = await supabase
    .from("exam_versions")
    .insert({
      exam_id: examId,
      version_no: versionNo,
      duration_seconds: source.duration_seconds,
      scoring_policy: scoring,
      source_format: source.source_format,
      raw_source_path: source.raw_source_path,
      compiled_hash: createHash("sha256")
        .update(`${source.compiled_hash}:${randomUUID()}`)
        .digest("hex"),
      published_at: null,
      created_by: adminUserId,
    })
    .select("id")
    .single();
  if (draftError) throw draftError;

  const uploaded: string[] = [];
  try {
    const [
      { data: assets, error: assetsError },
      { data: questions, error: questionsError },
    ] = await Promise.all([
      supabase
        .from("assets")
        .select("storage_path,original_name,mime_type,sha256")
        .eq("exam_version_id", sourceVersionId),
      supabase
        .from("questions")
        .select(
          "position,code,category,body_md,options,correct_key,points_correct,points_wrong,image_paths,tags,explanation_md",
        )
        .eq("exam_version_id", sourceVersionId)
        .order("position"),
    ]);
    if (assetsError) throw assetsError;
    if (questionsError) throw questionsError;
    for (const asset of assets ?? []) {
      const { data: file, error: downloadError } = await supabase.storage
        .from(BUCKET)
        .download(asset.storage_path);
      if (downloadError) throw downloadError;
      const storagePath = `${examId}/v${versionNo}/${asset.original_name}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, { contentType: asset.mime_type });
      if (uploadError) throw uploadError;
      uploaded.push(storagePath);
      const { error: assetInsertError } = await supabase.from("assets").insert({
        exam_version_id: draft.id,
        storage_path: storagePath,
        original_name: asset.original_name,
        mime_type: asset.mime_type,
        sha256: asset.sha256,
      });
      if (assetInsertError) throw assetInsertError;
    }
    if (questions?.length) {
      const { error: questionInsertError } = await supabase
        .from("questions")
        .insert(
          questions.map((question) => ({
            ...question,
            exam_version_id: draft.id,
          })),
        );
      if (questionInsertError) throw questionInsertError;
    }
    return { versionId: draft.id, versionNo };
  } catch (error) {
    if (uploaded.length) await supabase.storage.from(BUCKET).remove(uploaded);
    await supabase.from("exam_versions").delete().eq("id", draft.id);
    throw error;
  }
}

export function validateQuestionInput(input: Record<string, unknown>) {
  const bodyMd = typeof input.bodyMd === "string" ? input.bodyMd.trim() : "";
  const category =
    typeof input.category === "string" ? input.category.trim() : "Toán học";
  const points = Number(input.points);
  const explanationMd =
    typeof input.explanationMd === "string" ? input.explanationMd : "";
  const options = Array.isArray(input.options)
    ? input.options
        .map((option, index) => {
          const value = record(option);
          const id =
            typeof value.id === "string"
              ? value.id.trim().toUpperCase()
              : String.fromCharCode(65 + index);
          return {
            id,
            label: id,
            text: typeof value.text === "string" ? value.text : "",
          };
        })
        .filter((option) => option.id)
    : [];
  const correctAnswer =
    typeof input.correctAnswer === "string"
      ? input.correctAnswer.trim().toUpperCase()
      : "";
  if (!bodyMd) throw new Error("Nội dung câu hỏi không được để trống.");
  if (!Number.isFinite(points) || points <= 0 || points > 1000)
    throw new Error("Điểm câu hỏi phải lớn hơn 0 và không quá 1000.");
  if (options.length < 2 || options.some((option) => !option.text.trim()))
    throw new Error("Cần ít nhất hai lựa chọn có nội dung.");
  if (new Set(options.map((option) => option.id)).size !== options.length)
    throw new Error("Mã lựa chọn không được trùng nhau.");
  if (!options.some((option) => option.id === correctAnswer))
    throw new Error("Đáp án đúng phải thuộc danh sách lựa chọn.");
  const assetNames = [
    ...new Set(
      markdownAssets(
        `${bodyMd}\n${explanationMd}\n${options.map((option) => option.text).join("\n")}`,
      ),
    ),
  ];
  return {
    bodyMd,
    category,
    points,
    explanationMd,
    options,
    correctAnswer,
    assetNames,
  };
}

export { encryptAnswer };
