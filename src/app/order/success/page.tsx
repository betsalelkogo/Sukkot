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
  const db = getDb();
  if (db && order && /^[0-9a-f-]{36}$/i.test(order)) {
    try {
      await fulfillPaidCheckout(db, order, "");
    } catch {
      console.error("checkout_fulfill_failed");
    }
  }

  const content = await getContent();
  return (
    <div className="min-h-screen">
      <Header logo={content.logo_text} />
      <main className="mx-auto max-w-xl px-5 py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold text-[var(--teal)]">{content.thankyou_title}</h1>
        <div className="mb-8 space-y-3 text-lg leading-8">
          {content.thankyou_body
            .split("\n")
            .filter(Boolean)
            .map((line) => (
              <p key={line}>{line}</p>
            ))}
        </div>
        <Link href="/catalog" className="btn-primary">
          בחזרה לקטלוג
        </Link>
      </main>
      <Footer text={content.footer_text} />
    </div>
  );
}
