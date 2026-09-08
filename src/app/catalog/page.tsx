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
          2 בדים גדולים ב-200 ₪ · 2 בדים קטנים ב-150 ₪ · 2 מנויילנים ב-50 ₪
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
