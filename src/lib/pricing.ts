export const VARIANTS = ["fabric_large", "fabric_small", "fabric_square", "laminated"] as const;

export type ProductVariant = (typeof VARIANTS)[number];

export const VARIANT_LABEL: Record<ProductVariant, string> = {
  fabric_large: "בד גדול 50×70, עם עץ ומתלה",
  fabric_small: "בד קטן 35×50, עם עץ ומתלה",
  fabric_square: "בד 50×50, עם עץ ומתלה",
  laminated: "מנויילן A3",
};

const DEAL_GROUP: Record<ProductVariant, "large" | "small" | "laminated" | null> = {
  fabric_large: "large",
  fabric_small: "small",
  fabric_square: null,
  laminated: "laminated",
};

export const PAIR_DEALS = {
  large: { pairPriceAgorot: 20000, unitAgorot: 12000, label: "כל שני קישוטים גדולים ב-200 ₪" },
  small: { pairPriceAgorot: 15000, unitAgorot: 8000, label: "כל שני קישוטים קטנים ב-150 ₪" },
  laminated: { pairPriceAgorot: 5000, unitAgorot: 3000, label: "כל שני מנויילנים ב-50 ₪" },
} as const;

export type PricedItem = {
  variant: ProductVariant;
  quantity: number;
  unitPriceAgorot: number;
};

export function dealDiscountAgorot(items: PricedItem[]) {
  let discount = 0;
  for (const [group, deal] of Object.entries(PAIR_DEALS)) {
    const quantity = items
      .filter((item) => DEAL_GROUP[item.variant] === group)
      .reduce((sum, item) => sum + item.quantity, 0);
    const pairs = Math.floor(quantity / 2);
    discount += pairs * (deal.unitAgorot * 2 - deal.pairPriceAgorot);
  }
  return discount;
}

export function startingPriceAgorot(product: {
  priceLargeAgorot: number | null;
  priceSmallAgorot: number | null;
  priceSquareAgorot: number | null;
  priceLaminatedAgorot: number;
}) {
  const prices = [
    product.priceLargeAgorot,
    product.priceSmallAgorot,
    product.priceSquareAgorot,
    product.priceLaminatedAgorot,
  ].filter((value): value is number => typeof value === "number" && value > 0);
  return Math.min(...prices);
}

export function priceForVariant(
  product: {
    priceLargeAgorot: number | null;
    priceSmallAgorot: number | null;
    priceSquareAgorot: number | null;
    priceLaminatedAgorot: number;
  },
  variant: ProductVariant,
) {
  if (variant === "fabric_large") return product.priceLargeAgorot;
  if (variant === "fabric_small") return product.priceSmallAgorot;
  if (variant === "fabric_square") return product.priceSquareAgorot;
  return product.priceLaminatedAgorot;
}
