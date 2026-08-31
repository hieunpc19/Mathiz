import { RoutePlaceholder } from "@/components/route-placeholder";

export default function ImportExamPage() {
  return (
    <RoutePlaceholder
      title="Import đề thi"
      description="Trang này sau này sẽ nhận nội dung Markdown, LaTeX và hình ảnh đã được chuẩn hóa để tạo phiên bản đề."
      route="/parent/exams/import"
    />
  );
}
