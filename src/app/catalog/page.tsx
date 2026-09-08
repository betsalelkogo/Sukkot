import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { getContent, getProducts } from "@/lib/queries";

export default async function CatalogPage() {
  const [content, products] = await Promise.all([getContent(), getProducts({ inStockOnly: true })]);

  return (
    <div className="min-h-screen">
      <Header logo={content.logo_text} />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="mb-3 text-4xl font-bold">כל הקישוטים</h1>
        <p className="mb-8 text-sm text-[var(--muted)]">
          בד גדול 50×70 ב-120 ₪ · בד קטן 35×50 ב-80 ₪ · מנויילן A3 ב-30 ₪ · כל שני גדולים ב-200 ₪
        </p>
        {products.length === 0 ? (
          <p className="rounded-lg bg-[var(--paper)] p-8 text-center">הקטלוג יתעדכן בקרוב.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer text={content.footer_text} />
    </div>
  );
}
