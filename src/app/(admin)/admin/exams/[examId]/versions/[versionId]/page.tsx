import { ExamVersionEditor } from "@/components/admin/exam-version-editor";

export default async function AdminExamVersionEditorPage({
  params,
}: {
  params: Promise<{ examId: string; versionId: string }>;
}) {
  const { examId, versionId } = await params;
  return <ExamVersionEditor examId={examId} versionId={versionId} />;
}
