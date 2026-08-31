import { RoutePlaceholder } from "@/components/route-placeholder";

export default async function StudentResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;

  return (
    <RoutePlaceholder
      title="Kết quả làm bài"
      description="Trang này sau này sẽ trình bày điểm số, thời gian và trạng thái đúng hoặc sai của từng câu."
      route="/student/results/[attemptId]"
      detail={`Mã route đang kiểm tra: ${attemptId}`}
    />
  );
}
