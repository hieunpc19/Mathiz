import { RoutePlaceholder } from "@/components/route-placeholder";

export default async function ParentExamPreviewPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;

  return (
    <RoutePlaceholder
      title="Xem trước đề thi"
      description="Trang này sau này sẽ hiển thị bản biên dịch của đề để phụ huynh kiểm tra trước khi xuất bản."
      route="/parent/exams/[examId]/preview"
      detail={`Mã route đang kiểm tra: ${examId}`}
    />
  );
}
