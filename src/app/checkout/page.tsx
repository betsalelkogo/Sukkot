import { CheckoutForm } from "@/components/CheckoutForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getContent, getPickupPoints } from "@/lib/queries";

export default async function CheckoutPage() {
  const [content, pickupPoints] = await Promise.all([getContent(), getPickupPoints({ activeOnly: true })]);
  return (
    <div className="min-h-screen">
      <Header logo={content.logo_text} />
      <main className="mx-auto max-w-xl px-5 py-10">
        <h1 className="mb-6 text-4xl font-bold">פרטי הזמנה ותשלום</h1>
        <CheckoutForm pickupPoints={pickupPoints} />
      </main>
      <Footer text={content.footer_text} />
    </div>
  );
}
