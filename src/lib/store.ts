export function isOrdersOpen(content: { orders_open: string }) {
  return content.orders_open === "true";
}

export function parseClosedPoints(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [place = "", contact = "", phone = "", ...addressParts] = line.split("|").map((part) => part.trim());
      return {
        place,
        contact,
        phone,
        address: addressParts.join(" | "),
      };
    })
    .filter((point) => point.place);
}
