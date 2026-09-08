import { compareAtAgorot, DISPLAY_SALE_PERCENT, formatIls } from "@/lib/money";

type Props = {
  agorot: number;
  prefix?: string;
  align?: "start" | "end";
};

export function SalePrice({ agorot, prefix, align = "start" }: Props) {
  const compareAt = compareAtAgorot(agorot);
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 ${align === "end" ? "justify-end" : ""}`}>
      {prefix ? <span>{prefix}</span> : null}
      <span className="text-[var(--muted)] line-through">{formatIls(compareAt)}</span>
      <span className="font-semibold text-[var(--teal-dark)]">{formatIls(agorot)}</span>
      <span className="rounded-sm bg-red-700 px-1.5 py-0.5 text-xs font-semibold text-white">
        {DISPLAY_SALE_PERCENT}%-
      </span>
    </span>
  );
}
