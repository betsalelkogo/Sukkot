export const ORDERS_OPEN = false;

export const SEASON_CLOSED_POINTS = [
  { place: "כרם רעים", contact: "תמר עמר", phone: "054-2307195", address: "הגלעד 34" },
  { place: "נווה דניאל", contact: "אלי רפאלי", phone: "052-9253070", address: "המוריה 29/4" },
  { place: "בית אל", contact: "אלישבע קהתי", phone: "054-6422233", address: "כ בחשוון, בניין קדמא 24/2" },
  { place: "אשקלון", contact: "יעל אסרף", phone: "052-425-0680", address: "קונדיטון 29, כניסה 2, דירה 1 (דירת גן), עיר היין" },
  { place: "ברוכין", contact: "שירה כותה", phone: "054-7203341", address: "האדרת 46" },
  { place: "כרמית", contact: "נעמה מקובסקי", phone: "050-8881074", address: "חוגלה 5" },
] as const;

export function shopPathClosed(pathname: string) {
  return (
    pathname === "/cart" ||
    pathname.startsWith("/cart/") ||
    pathname === "/checkout" ||
    pathname.startsWith("/checkout/") ||
    pathname.startsWith("/product/") ||
    pathname === "/api/checkout" ||
    pathname.startsWith("/api/checkout/")
  );
}
