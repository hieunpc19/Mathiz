import { RoutePlaceholder } from "@/components/route-placeholder";

export default async function StudentExamPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;

  return (
    <RoutePlaceholder
      title="Thông tin đề thi"
      description="Trang này sau này sẽ giới thiệu đề, thời lượng và cho phép bé bắt đầu một lượt làm bài."
      route="/student/exams/[examId]"
      detail={`Mã route đang kiểm tra: ${examId}`}
    />
  );
}
