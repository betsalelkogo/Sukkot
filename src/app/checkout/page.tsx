import { CheckoutForm } from "@/components/CheckoutForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getContent } from "@/lib/queries";

export default async function CheckoutPage() {
  const content = await getContent();
  return (
    <div className="min-h-screen">
      <Header logo={content.logo_text} />
      <main className="mx-auto max-w-xl px-5 py-10">
        <h1 className="mb-6 text-4xl font-bold">פרטי משלוח ותשלום</h1>
        <CheckoutForm />
      </main>
      <Footer text={content.footer_text} />
    </div>
  );
}
