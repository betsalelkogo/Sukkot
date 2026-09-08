export const VARIANTS = ["fabric_large", "fabric_small", "fabric_square", "laminated"] as const;

export type ProductVariant = (typeof VARIANTS)[number];

export const VARIANT_LABEL: Record<ProductVariant, string> = {
  fabric_large: "בד גדול 50×70, עם עץ ומתלה",
  fabric_small: "בד קטן 35×50, עם עץ ומתלה",
  fabric_square: "בד 50×50, עם עץ ומתלה",
  laminated: "מנויילן A3",
};

export type ProductLabelInfo = {
  fabricShape?: string | null;
  customFabricSize?: string | null;
  customLaminatedSize?: string | null;
};

export function variantLabel(variant: ProductVariant, product?: ProductLabelInfo | null) {
  if (variant === "fabric_large" && product?.fabricShape === "custom" && product.customFabricSize) {
    return `בד ${product.customFabricSize}, עם עץ ומתלה`;
  }
  if (variant === "laminated") {
    if (product?.fabricShape === "square") {
      return "מנויילן 30×30";
    }
    if (product?.fabricShape === "custom" && product.customLaminatedSize) {
      return `מנויילן ${product.customLaminatedSize}`;
    }
  }
  return VARIANT_LABEL[variant];
}

export function offeredVariants(product: {
  priceLargeAgorot: number | null;
  priceSmallAgorot: number | null;
  priceSquareAgorot: number | null;
  priceLaminatedAgorot: number | null;
}) {
  return VARIANTS.filter((variant) => Boolean(priceForVariant(product, variant)));
}

export const DEAL_GROUP: Record<ProductVariant, "large" | "small" | "laminated" | null> = {
  fabric_large: "large",
  fabric_small: "small",
  fabric_square: "large",
  laminated: "laminated",
};

export const PAIR_DEALS = {
  large: {
    pairPriceAgorot: 20000,
    unitAgorot: 12000,
    label: "2 בדים גדולים ב-200 ₪",
  },
  small: {
    pairPriceAgorot: 15000,
    unitAgorot: 8000,
    label: "2 בדים קטנים ב-150 ₪",
  },
  laminated: {
    pairPriceAgorot: 5000,
    unitAgorot: 3000,
    label: "2 מנויילנים ב-50 ₪",
  },
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
  priceLaminatedAgorot: number | null;
}) {
  const prices = [
    product.priceLargeAgorot,
    product.priceSmallAgorot,
    product.priceSquareAgorot,
    product.priceLaminatedAgorot,
  ].filter((value): value is number => typeof value === "number" && value > 0);
  return prices.length ? Math.min(...prices) : 0;
}

export type StockedProduct = {
  priceLargeAgorot: number | null;
  priceSmallAgorot: number | null;
  priceSquareAgorot: number | null;
  priceLaminatedAgorot: number | null;
  stockLarge: number;
  stockSmall: number;
  stockSquare: number;
  stockLaminated: number;
};

export function stockForVariant(product: StockedProduct, variant: ProductVariant) {
  if (variant === "fabric_large") return product.stockLarge;
  if (variant === "fabric_small") return product.stockSmall;
  if (variant === "fabric_square") return product.stockSquare;
  return product.stockLaminated;
}

export function hasAnyStock(product: StockedProduct) {
  return VARIANTS.some((variant) => {
    const price = priceForVariant(product, variant);
    return Boolean(price) && stockForVariant(product, variant) > 0;
  });
}

export function priceForVariant(
  product: {
    priceLargeAgorot: number | null;
    priceSmallAgorot: number | null;
    priceSquareAgorot: number | null;
    priceLaminatedAgorot: number | null;
  },
  variant: ProductVariant,
) {
  if (variant === "fabric_large") return product.priceLargeAgorot;
  if (variant === "fabric_small") return product.priceSmallAgorot;
  if (variant === "fabric_square") return product.priceSquareAgorot;
  return product.priceLaminatedAgorot;
}
