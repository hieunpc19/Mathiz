import "server-only";

import { createHash } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { parseExamPackage } from "@/lib/exams/package-parser";
import { encryptAnswer } from "@/lib/exams/answer-crypto";
import { resolvePackagePath } from "@/lib/exams/package-catalog";

const BUCKET = "exam-assets";
const DEFAULT_PACKAGE_FILE = "timo-preliminary-2020-2021-set-01.zip";

export type ImportExamOptions = {
  packageFile?: string;
  durationMinutes?: number;
  gradeMin?: number;
  gradeMax?: number;
};

function validateOptions(options: ImportExamOptions) {
  const durationMinutes = options.durationMinutes ?? 90;
  const gradeMin = options.gradeMin ?? 1;
  const gradeMax = options.gradeMax ?? 5;
  const packageFile = options.packageFile ?? DEFAULT_PACKAGE_FILE;
  if (typeof packageFile !== "string" || !packageFile.trim()) {
    throw new Error("packageFile phải là tên một gói ZIP trong thư mục data.");
  }

  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 1 ||
    durationMinutes > 600
  ) {
    throw new Error("durationMinutes phải là số nguyên từ 1 đến 600.");
  }
  if (
    !Number.isInteger(gradeMin) ||
    !Number.isInteger(gradeMax) ||
    gradeMin < 1 ||
    gradeMax > 12 ||
    gradeMin > gradeMax
  ) {
    throw new Error("Khoảng khối lớp không hợp lệ.");
  }
  return { durationMinutes, gradeMin, gradeMax, packageFile };
}

export async function importBundledExam(
  adminUserId: string,
  options: ImportExamOptions = {},
) {
  const config = validateOptions(options);
  const zipPath = resolvePackagePath(config.packageFile);
  const examPackage = parseExamPackage(zipPath);
  const supabase = createSupabaseAdminClient();
  const sourceUrl = `package:${examPackage.packageId}`;
  const compiledHash = createHash("sha256")
    .update(
      JSON.stringify({
        sourceHash: examPackage.sourceHash,
        compilerVersion: 3,
        durationMinutes: config.durationMinutes,
        gradeMin: config.gradeMin,
        gradeMax: config.gradeMax,
      }),
    )
    .digest("hex");

  const { data: existingExam, error: findError } = await supabase
    .from("exams")
    .select("id")
    .eq("source_url", sourceUrl)
    .maybeSingle();
  if (findError) throw findError;

  let examId = existingExam?.id as string | undefined;
  let createdExam = false;

  if (!examId) {
    const { data, error } = await supabase
      .from("exams")
      .insert({
        title: examPackage.title,
        competition: examPackage.competition,
        round: examPackage.round,
        school_year: examPackage.schoolYear,
        grade_min: config.gradeMin,
        grade_max: config.gradeMax,
        languages: examPackage.languages,
        source_url: sourceUrl,
        rights_note: examPackage.rightsNote,
        status: "draft",
        created_by: adminUserId,
      })
      .select("id")
      .single();
    if (error) throw error;
    examId = data.id;
    createdExam = true;
  }

  const { data: versions, error: versionsError } = await supabase
    .from("exam_versions")
    .select("version_no")
    .eq("exam_id", examId)
    .order("version_no", { ascending: false })
    .limit(1);
  if (versionsError) throw versionsError;
  const versionNo = (versions?.[0]?.version_no ?? 0) + 1;
  const metadata = {
    packageId: examPackage.packageId,
    sourceFileName: examPackage.sourceFileName,
    questionCount: examPackage.questionCount,
    maxScore: examPackage.maxScore,
    subtitle:
      "Thailand International Mathematical Olympiad • Vòng loại quốc gia",
    description:
      "Đề TIMO song ngữ Anh–Việt gồm 25 câu tư duy lô-gic, số học, lý thuyết số, hình học và tổ hợp.",
    difficulty: "Phù hợp tiểu học",
    rules: [
      `Thời gian làm bài: ${config.durationMinutes} phút cho ${examPackage.questionCount} câu trắc nghiệm.`,
      "Mỗi câu đúng được 4 điểm; không trừ điểm khi sai hoặc bỏ trống.",
      "Bài làm được lưu vào hệ thống và được chấm trên máy chủ sau khi nộp.",
    ],
    lifecycleStatus: "draft",
    examMetadata: {
      title: examPackage.title,
      competition: examPackage.competition,
      round: examPackage.round,
      schoolYear: examPackage.schoolYear,
      gradeMin: config.gradeMin,
      gradeMax: config.gradeMax,
      languages: examPackage.languages,
      rightsNote: examPackage.rightsNote,
    },
  };

  let versionId: string | undefined;
  const uploadedPaths: string[] = [];
  try {
    const { data: version, error: versionError } = await supabase
      .from("exam_versions")
      .insert({
        exam_id: examId,
        version_no: versionNo,
        duration_seconds: config.durationMinutes * 60,
        scoring_policy: { correct: 4, wrong: 0, blank: 0, ...metadata },
        source_format: "markdown",
        raw_source_path: `data/${config.packageFile}`,
        compiled_hash: compiledHash,
        published_at: null,
        created_by: adminUserId,
      })
      .select("id")
      .single();
    if (versionError) throw versionError;
    versionId = version.id;

    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();
    if (bucketsError) throw bucketsError;
    if (
      !buckets.some((bucket) => bucket.id === BUCKET || bucket.name === BUCKET)
    ) {
      const { error: bucketError } = await supabase.storage.createBucket(
        BUCKET,
        {
          public: false,
          fileSizeLimit: 5 * 1024 * 1024,
          allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
        },
      );
      if (bucketError) throw bucketError;
    }

    for (const asset of examPackage.assets) {
      const storagePath = `${examId}/v${versionNo}/${asset.name}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, asset.data, {
          contentType: asset.mimeType,
          upsert: false,
        });
      if (uploadError) throw uploadError;
      uploadedPaths.push(storagePath);

      const { error: assetError } = await supabase.from("assets").insert({
        exam_version_id: versionId,
        storage_path: storagePath,
        original_name: asset.name,
        mime_type: asset.mimeType,
        sha256: asset.sha256,
      });
      if (assetError) throw assetError;
    }

    const { error: questionsError } = await supabase.from("questions").insert(
      examPackage.questions.map((question, index) => ({
        exam_version_id: versionId,
        position: index + 1,
        code: question.code,
        category: question.category,
        body_md: question.bodyMd,
        options: question.options,
        correct_key: encryptAnswer(question.answer),
        points_correct: question.points,
        points_wrong: 0,
        image_paths: question.assetNames,
        tags: question.sourcePage ? [`source-page:${question.sourcePage}`] : [],
        explanation_md: "",
      })),
    );
    if (questionsError) throw questionsError;

    if (createdExam) {
      const { error: metadataError } = await supabase
        .from("exams")
        .update({
          title: examPackage.title,
          competition: examPackage.competition,
          round: examPackage.round,
          school_year: examPackage.schoolYear,
          grade_min: config.gradeMin,
          grade_max: config.gradeMax,
          languages: examPackage.languages,
          rights_note: examPackage.rightsNote,
          status: "draft",
        })
        .eq("id", examId);
      if (metadataError) throw metadataError;
    }
  } catch (error) {
    if (uploadedPaths.length)
      await supabase.storage.from(BUCKET).remove(uploadedPaths);
    if (versionId)
      await supabase.from("exam_versions").delete().eq("id", versionId);
    if (createdExam) await supabase.from("exams").delete().eq("id", examId);
    throw error;
  }

  return {
    examId,
    versionId,
    versionNo,
    questionCount: examPackage.questionCount,
    reused: Boolean(existingExam),
    published: false,
  };
}
