import { apiError, requireProfile } from "@/lib/api/auth";
import { requireDraftVersion } from "@/lib/exams/admin-versions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ examId: string; versionId: string; assetId: string }>;
  },
) {
  const auth = await requireProfile("admin");
  if ("response" in auth) return auth.response;
  const { examId, versionId, assetId } = await params;
  try {
    const draft = await requireDraftVersion(examId, versionId);
    if ("error" in draft)
      return apiError(
        "VERSION_IMMUTABLE",
        "Chỉ được xóa ảnh của bản nháp.",
        409,
      );
    const supabase = createSupabaseAdminClient();
    const { data: asset, error: assetError } = await supabase
      .from("assets")
      .select("storage_path")
      .eq("id", assetId)
      .eq("exam_version_id", versionId)
      .maybeSingle();
    if (assetError) throw assetError;
    if (!asset) return apiError("ASSET_NOT_FOUND", "Không tìm thấy ảnh.", 404);
    const { error: storageError } = await supabase.storage
      .from("exam-assets")
      .remove([asset.storage_path]);
    if (storageError) throw storageError;
    const { error } = await supabase.from("assets").delete().eq("id", assetId);
    if (error) throw error;
    return Response.json({ data: { deleted: true } });
  } catch (error) {
    console.error("Delete exam asset failed", error);
    return apiError("ASSET_DELETE_FAILED", "Không thể xóa ảnh.", 500);
  }
}
