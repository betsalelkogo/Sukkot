import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { fulfillPaidCheckout } from "@/lib/checkout-session";
import { getDb } from "@/lib/db";
import { getContent } from "@/lib/queries";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  let saved = false;
  const db = getDb();
  if (db && order && /^[0-9a-f-]{36}$/i.test(order)) {
    try {
      saved = Boolean(await fulfillPaidCheckout(db, order, ""));
    } catch {
      console.error("checkout_fulfill_failed");
    }
  }

  const content = await getContent();
  return (
    <div className="min-h-screen">
      <Header logo={content.logo_text} />
      <main className="mx-auto max-w-xl px-5 py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold text-[var(--teal)]">ההזמנה התקבלה</h1>
        <p className="mb-8 text-lg leading-8">
          {saved
            ? "תודה! ההזמנה נשמרה אצלנו, והקבלה תישלח אליכם במייל דרך Morning. נעדכן אתכם לגבי האיסוף."
            : "תודה! התשלום התקבל. ההזמנה נשמרת אצלנו ברגע שהאישור מ-Morning מגיע, והקבלה תישלח אליכם במייל. נעדכן אתכם לגבי האיסוף."}
        </p>
        <Link href="/catalog" className="btn-primary">
          בחזרה לקטלוג
        </Link>
      </main>
      <Footer text={content.footer_text} />
    </div>
  );
}
