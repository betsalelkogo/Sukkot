import Link from "next/link";
import { formatIls } from "@/lib/money";
import { startingPriceAgorot } from "@/lib/pricing";
import type { ProductRecord } from "@/lib/queries";

export function ProductCard({ product }: { product: ProductRecord }) {
  return (
    <article className="overflow-hidden rounded-md border border-[var(--line)] bg-white">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="aspect-[3/4] bg-[#f7f4ee]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <h3 className="text-xl font-semibold">{product.name}</h3>
        <p className="min-h-12 text-sm text-[var(--muted)]">{product.description}</p>
        <p className="text-sm">מ-{formatIls(startingPriceAgorot(product))}</p>
        <p className="text-sm text-[var(--muted)]">
          {product.stockQuantity > 0 ? `${product.stockQuantity} במלאי` : "אזל מהמלאי"}
        </p>
        <Link href={`/product/${product.slug}`} className="btn-primary w-full">
          לרכישה
        </Link>
      </div>
    </article>
  );
}
