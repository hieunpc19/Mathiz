import { apiError, requireProfile } from "@/lib/api/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ examId: string; path: string[] }> },
) {
  const auth = await requireProfile();
  if ("response" in auth) return auth.response;
  const { examId, path } = await params;
  const versionId = new URL(request.url).searchParams.get("versionId");
  const originalName = path.map(decodeURIComponent).join("/");
  if (
    !versionId ||
    !originalName ||
    originalName.includes("..") ||
    originalName.startsWith("/")
  ) {
    return apiError("INVALID_ASSET_PATH", "Đường dẫn ảnh không hợp lệ.", 400);
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select("status")
      .eq("id", examId)
      .maybeSingle();
    if (examError) throw examError;
    if (
      !exam ||
      (exam.status !== "published" && auth.profile.role !== "admin")
    ) {
      return apiError("ASSET_NOT_FOUND", "Không tìm thấy ảnh.", 404);
    }
    const { data: version, error: versionError } = await supabase
      .from("exam_versions")
      .select("id,published_at")
      .eq("id", versionId)
      .eq("exam_id", examId)
      .maybeSingle();
    if (versionError) throw versionError;
    if (!version || (!version.published_at && auth.profile.role !== "admin")) {
      return apiError("ASSET_NOT_FOUND", "Không tìm thấy ảnh.", 404);
    }
    const { data: asset, error: assetError } = await supabase
      .from("assets")
      .select("storage_path,mime_type,sha256")
      .eq("exam_version_id", versionId)
      .eq("original_name", originalName)
      .maybeSingle();
    if (assetError) throw assetError;
    if (!asset) return apiError("ASSET_NOT_FOUND", "Không tìm thấy ảnh.", 404);
    const { data: file, error: downloadError } = await supabase.storage
      .from("exam-assets")
      .download(asset.storage_path);
    if (downloadError) throw downloadError;
    return new Response(await file.arrayBuffer(), {
      headers: {
        "Content-Type": asset.mime_type,
        "Cache-Control": "private, max-age=3600",
        ETag: `"${asset.sha256}"`,
      },
    });
  } catch (error) {
    console.error("Load exam asset failed", error);
    return apiError("ASSET_UNAVAILABLE", "Không thể tải ảnh.", 503);
  }
}
