import { ContentForm } from "@/components/admin/ContentForm";
import { getContent } from "@/lib/queries";

export default async function AdminContentPage() {
  const content = await getContent();
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">עריכת תוכן</h1>
      <ContentForm defaultValues={content} />
    </div>
  );
}
