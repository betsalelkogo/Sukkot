"use client";

import { PAIR_DEALS } from "@/lib/pricing";

type DealGroup = keyof typeof PAIR_DEALS;

type Props = {
  group: DealGroup;
  canAddAnother: boolean;
  onAddAnother: () => void;
  onGoCart: () => void;
  onKeepShopping: () => void;
};

export function DealPopup({ group, canAddAnother, onAddAnother, onGoCart, onKeepShopping }: Props) {
  const deal = PAIR_DEALS[group];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5" role="dialog" aria-modal="true">
      <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 text-center shadow-lg">
        <h2 className="text-2xl font-bold text-[var(--teal)]">יש מבצע זוגות</h2>
        <p className="text-lg leading-8">
          הוספתם פריט אחד. הוסיפו עוד אחד ותשלמו רק
          <br />
          <strong>{deal.label}</strong>
        </p>
        <div className="flex flex-col gap-3">
          {canAddAnother ? (
            <button type="button" className="btn-primary w-full" onClick={onAddAnother}>
              הוסיפו עוד אחד לאותו דגם
            </button>
          ) : null}
          <button
            type="button"
            className="w-full rounded-md border border-[var(--line)] px-4 py-3 font-semibold"
            onClick={onKeepShopping}
          >
            לבחור דגם נוסף
          </button>
          <button type="button" className="text-sm text-[var(--muted)]" onClick={onGoCart}>
            להמשיך לעגלה
          </button>
        </div>
      </div>
    </div>
  );
}
