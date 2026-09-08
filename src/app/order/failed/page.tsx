import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getContent } from "@/lib/queries";

export default async function FailedPage() {
  const content = await getContent();
  return (
    <div className="min-h-screen">
      <Header logo={content.logo_text} />
      <main className="mx-auto max-w-xl px-5 py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold">התשלום לא הושלם</h1>
        <p className="mb-8 text-lg leading-8">אפשר לחזור לעגלה ולנסות שוב. לא חויב כרטיס.</p>
        <Link href="/cart" className="btn-primary">
          חזרה לעגלה
        </Link>
      </main>
      <Footer text={content.footer_text} />
    </div>
  );
}
