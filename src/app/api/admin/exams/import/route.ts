import { apiError, requireProfile } from "@/lib/api/auth";
import {
  importBundledExam,
  type ImportExamOptions,
} from "@/lib/exams/import-package";
import { listExamPackages } from "@/lib/exams/package-catalog";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireProfile("admin");
  if ("response" in auth) return auth.response;
  try {
    return Response.json({ data: { packages: await listExamPackages() } });
  } catch (error) {
    console.error("List exam packages failed", error);
    return apiError(
      "PACKAGE_SCAN_FAILED",
      "Không thể đọc danh sách gói đề.",
      500,
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireProfile("admin");
  if ("response" in auth) return auth.response;

  let input: ImportExamOptions = {};
  try {
    const text = await request.text();
    input = text ? (JSON.parse(text) as ImportExamOptions) : {};
  } catch {
    return apiError("INVALID_JSON", "Nội dung JSON không hợp lệ.", 400);
  }

  try {
    const result = await importBundledExam(auth.profile.userId, input);
    return Response.json(
      { data: result },
      { status: result.reused ? 200 : 201 },
    );
  } catch (error) {
    console.error("Exam import failed", error);
    const message =
      error instanceof Error ? error.message : "Không thể import đề thi.";
    return apiError("IMPORT_FAILED", message, 422);
  }
}
