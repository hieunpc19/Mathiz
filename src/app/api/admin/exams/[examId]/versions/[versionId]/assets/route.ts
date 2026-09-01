import { createHash, randomBytes } from "node:crypto";
import { apiError, requireProfile } from "@/lib/api/auth";
import { requireDraftVersion } from "@/lib/exams/admin-versions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function safeName(name: string) {
  const extension = name.toLowerCase().match(/\.(png|jpe?g|webp)$/)?.[0] ?? "";
  const base =
    name
      .slice(0, extension ? -extension.length : undefined)
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "image";
  return `${base}${extension}`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ examId: string; versionId: string }> },
) {
  const auth = await requireProfile("admin");
  if ("response" in auth) return auth.response;
  const { examId, versionId } = await params;
  try {
    const draft = await requireDraftVersion(examId, versionId);
    if ("error" in draft)
      return apiError(
        "VERSION_IMMUTABLE",
        "Chỉ được thêm ảnh vào bản nháp.",
        409,
      );
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File))
      return apiError("FILE_REQUIRED", "Vui lòng chọn một ảnh.", 422);
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      return apiError(
        "INVALID_FILE_TYPE",
        "Chỉ hỗ trợ PNG, JPEG và WebP.",
        422,
      );
    }
    if (file.size > 5 * 1024 * 1024)
      return apiError("FILE_TOO_LARGE", "Ảnh không được vượt quá 5 MB.", 422);
    const supabase = createSupabaseAdminClient();
    const { data: existing } = await supabase
      .from("assets")
      .select("original_name")
      .eq("exam_version_id", versionId);
    let name = safeName(file.name);
    const existingNames = new Set(
      (existing ?? []).map((asset) => asset.original_name),
    );
    if (existingNames.has(name)) {
      const extension = name.match(/\.[^.]+$/)?.[0] ?? "";
      name = `${name.slice(0, extension ? -extension.length : undefined)}-${randomBytes(3).toString("hex")}${extension}`;
    }
    const data = Buffer.from(await file.arrayBuffer());
    const storagePath = `${examId}/v${draft.version.version_no}/editor/${name}`;
    const { error: uploadError } = await supabase.storage
      .from("exam-assets")
      .upload(storagePath, data, { contentType: file.type });
    if (uploadError) throw uploadError;
    const { data: asset, error: insertError } = await supabase
      .from("assets")
      .insert({
        exam_version_id: versionId,
        storage_path: storagePath,
        original_name: name,
        mime_type: file.type,
        sha256: createHash("sha256").update(data).digest("hex"),
      })
      .select("id,original_name,mime_type")
      .single();
    if (insertError) {
      await supabase.storage.from("exam-assets").remove([storagePath]);
      throw insertError;
    }
    return Response.json(
      {
        data: {
          asset: {
            ...asset,
            url: `/api/exams/${examId}/assets/${name}?versionId=${versionId}`,
            markdown: `![Mô tả ảnh](assets/${name})`,
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Upload exam asset failed", error);
    return apiError("ASSET_UPLOAD_FAILED", "Không thể tải ảnh lên.", 500);
  }
}
