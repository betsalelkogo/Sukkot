import Link from "next/link";
import { SalePrice } from "@/components/SalePrice";
import { hasAnyStock, startingPriceAgorot } from "@/lib/pricing";
import type { ProductRecord } from "@/lib/queries";

export function ProductCard({ product }: { product: ProductRecord }) {
  return (
    <article className="overflow-hidden rounded-md border border-[var(--line)] bg-white">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] bg-[#f7f4ee]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
          <span className="absolute start-3 top-3 rounded-sm bg-red-700 px-2 py-1 text-xs font-semibold text-white">
            10%-
          </span>
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <h3 className="text-xl font-semibold">{product.name}</h3>
        <p className="min-h-12 text-sm text-[var(--muted)]">{product.description}</p>
        <p className="text-sm">
          <SalePrice agorot={startingPriceAgorot(product)} prefix="מ-" />
        </p>
        {hasAnyStock(product) ? null : <p className="text-sm text-[var(--muted)]">אזל מהמלאי</p>}
        <Link href={`/product/${product.slug}`} className="btn-primary w-full">
          לרכישה
        </Link>
      </div>
    </article>
  );
}
