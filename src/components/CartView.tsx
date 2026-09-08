"use client";

import Link from "next/link";
import { formatIls } from "@/lib/money";
import { PAIR_DEALS, VARIANT_LABEL } from "@/lib/pricing";
import { useCart } from "./CartProvider";

export function CartView() {
  const { items, subtotalAgorot, discountAgorot, totalAgorot, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-lg bg-[var(--paper)] p-8 text-center">
        <p className="mb-4">העגלה ריקה כרגע.</p>
        <Link href="/catalog" className="btn-primary">
          לקטלוג
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <div
          key={`${item.productId}-${item.variant}`}
          className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt="" className="h-24 w-20 rounded object-cover" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{item.name}</h2>
            <p className="text-sm text-[var(--muted)]">{item.variantLabel || VARIANT_LABEL[item.variant]}</p>
            <p>{formatIls(item.unitPriceAgorot)}</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={99}
              value={item.quantity}
              onChange={(event) =>
                updateQuantity(item.productId, item.variant, Number(event.target.value))
              }
              className="w-16 rounded border border-[var(--line)] px-2 py-1"
            />
            <button
              type="button"
              className="text-sm text-red-700"
              onClick={() => removeItem(item.productId, item.variant)}
            >
              הסרה
            </button>
          </div>
        </div>
      ))}
      <div className="space-y-2 text-sm text-[var(--muted)]">
        {Object.values(PAIR_DEALS).map((deal) => (
          <p key={deal.label}>{deal.label}</p>
        ))}
      </div>
      <div className="space-y-2 text-lg">
        <div className="flex items-center justify-between">
          <span>ביניים</span>
          <span>{formatIls(subtotalAgorot)}</span>
        </div>
        {discountAgorot > 0 ? (
          <div className="flex items-center justify-between text-[var(--teal-dark)]">
            <span>הנחת מבצע</span>
            <span>-{formatIls(discountAgorot)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between text-xl font-semibold">
          <span>סה״כ</span>
          <span>{formatIls(totalAgorot)}</span>
        </div>
      </div>
      <Link href="/checkout" className="btn-primary">
        לתשלום
      </Link>
    </div>
  );
}
