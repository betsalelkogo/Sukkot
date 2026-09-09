import Link from "next/link";
import { TermsForm } from "@/components/admin/TermsForm";
import { getContent } from "@/lib/queries";

export default async function AdminTermsPage() {
  const content = await getContent();
  return (
    <div className="max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">עריכת תקנון</h1>
        <p className="text-sm text-[var(--muted)]">עודכן לאחרונה: {content.terms_updated}</p>
        <Link href="/terms" className="text-sm text-[var(--teal)]">
          צפייה בעמוד התקנון
        </Link>
      </div>
      <TermsForm title={content.terms_title} body={content.terms_body} />
    </div>
  );
}
