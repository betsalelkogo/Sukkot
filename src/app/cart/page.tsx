import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CartView } from "@/components/CartView";
import { getContent } from "@/lib/queries";

export default async function CartPage() {
  const content = await getContent();
  return (
    <div className="min-h-screen">
      <Header logo={content.logo_text} />
      <main className="mx-auto max-w-4xl px-5 py-10">
        <h1 className="mb-8 text-4xl font-bold">העגלה</h1>
        <CartView />
      </main>
      <Footer text={content.footer_text} />
    </div>
  );
}
