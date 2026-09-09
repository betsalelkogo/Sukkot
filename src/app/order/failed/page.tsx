import Link from "next/link";
import { abandonCheckoutSession } from "@/lib/checkout-session";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getDb } from "@/lib/db";
import { getContent } from "@/lib/queries";

export default async function FailedPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const db = getDb();
  if (db && order) {
    try {
      await abandonCheckoutSession(db, order);
    } catch {
      // keep the customer-facing page generic
    }
  }

  const content = await getContent();
  return (
    <div className="min-h-screen">
      <Header logo={content.logo_text} />
      <main className="mx-auto max-w-xl px-5 py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold">התשלום לא הושלם</h1>
        <p className="mb-8 text-lg leading-8">אפשר לחזור לעגלה ולנסות שוב. לא נשמרה הזמנה ולא חויב כרטיס.</p>
        <Link href="/cart" className="btn-primary">
          חזרה לעגלה
        </Link>
      </main>
      <Footer text={content.footer_text} />
    </div>
  );
}
