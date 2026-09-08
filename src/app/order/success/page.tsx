import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getContent } from "@/lib/queries";

export default async function SuccessPage() {
  const content = await getContent();
  return (
    <div className="min-h-screen">
      <Header logo={content.logo_text} />
      <main className="mx-auto max-w-xl px-5 py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold text-[var(--teal)]">ההזמנה התקבלה</h1>
        <p className="mb-8 text-lg leading-8">
          תודה! אם התשלום הושלם, החשבונית תישלח אליכם במייל דרך Morning. אנחנו ניצור קשר לגבי המשלוח.
        </p>
        <Link href="/catalog" className="btn-primary">
          בחזרה לקטלוג
        </Link>
      </main>
      <Footer text={content.footer_text} />
    </div>
  );
}
