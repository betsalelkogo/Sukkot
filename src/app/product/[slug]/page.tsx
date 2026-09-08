import { notFound } from "next/navigation";
import { AddToCart } from "@/components/AddToCart";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductGallery } from "@/components/ProductGallery";
import { offeredVariants, variantLabel } from "@/lib/pricing";
import { getContent, getProductBySlug } from "@/lib/queries";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [content, product] = await Promise.all([getContent(), getProductBySlug(slug)]);
  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Header logo={content.logo_text} />
      <main className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-2">
        <ProductGallery name={product.name} images={[product.imageUrl, ...product.galleryUrls]} />
        <div className="space-y-5">
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <p className="text-lg leading-8 text-[#333]">{product.description}</p>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li>מאוייר בעבודת יד ומודפס על בד מיוחד</li>
            <li>עמיד בגשם ומחזיק לשנים</li>
            <li>מגיע עם עץ ומתלה, מוכן לתלייה</li>
            <li>{offeredVariants(product).map((variant) => variantLabel(variant, product)).join(" · ") || "גודל לפי בחירה"}</li>
          </ul>
          <AddToCart product={product} />
        </div>
      </main>
      <Footer text={content.footer_text} />
    </div>
  );
}
