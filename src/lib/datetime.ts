const ISRAEL_TIME_ZONE = "Asia/Jerusalem";

export function formatIsraelDateTime(date: Date) {
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: ISRAEL_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
