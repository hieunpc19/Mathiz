import { RoutePlaceholder } from "@/components/route-placeholder";

export default async function StudentAttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;

  return (
    <RoutePlaceholder
      title="Làm bài"
      description="Trang này sau này sẽ chứa câu hỏi trắc nghiệm, đồng hồ, tự động lưu và thao tác nộp bài."
      route="/student/attempts/[attemptId]"
      detail={`Mã route đang kiểm tra: ${attemptId}`}
    />
  );
}
