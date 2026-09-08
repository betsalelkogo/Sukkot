export function shekelsToAgorot(shekels: number): number {
  return Math.round(shekels * 100);
}

export function agorotToShekels(agorot: number): number {
  return agorot / 100;
}

export function formatIls(agorot: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(agorotToShekels(agorot));
}

/** Display-only compare-at price so the real price looks like 10% off. */
export const DISPLAY_SALE_PERCENT = 10;

export function compareAtAgorot(saleAgorot: number) {
  if (saleAgorot <= 0) {
    return 0;
  }
  return shekelsToAgorot(Math.round(agorotToShekels(saleAgorot) / (1 - DISPLAY_SALE_PERCENT / 100)));
}
