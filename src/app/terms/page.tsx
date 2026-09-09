import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TermsDocument } from "@/components/TermsDocument";
import { BUSINESS } from "@/lib/business";
import { getContent } from "@/lib/queries";

export default async function TermsPage() {
  const content = await getContent();
  return (
    <div className="min-h-screen">
      <Header logo={content.logo_text} />
      <main className="mx-auto max-w-3xl space-y-8 px-5 py-10 leading-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">{content.terms_title}</h1>
          <p className="text-xl font-semibold">{BUSINESS.name}</p>
          <p className="text-sm text-[var(--muted)]">עודכן לאחרונה: {content.terms_updated}</p>
        </div>
        <TermsDocument body={content.terms_body} />
        <Link href="/checkout" className="inline-block text-[var(--teal)]">
          חזרה לתשלום
        </Link>
      </main>
      <Footer text={content.footer_text} />
    </div>
  );
}
