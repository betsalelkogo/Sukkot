import { SEASON_CLOSED_POINTS } from "@/lib/store";

function phoneHref(phone: string) {
  return `tel:${phone.replace(/\D/g, "")}`;
}

export function ClosedNotice() {
  return (
    <section className="mx-auto max-w-4xl px-5 py-10 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/season-closed.png"
        alt="תמרפאלי · מחל שנה וברכותיה"
        className="mx-auto w-full max-w-md"
      />
      <h1 className="mt-8 text-3xl font-bold text-[var(--teal)] sm:text-4xl">לקוחות יקרים!!</h1>
      <p className="mt-5 text-lg leading-8">תמו ההזמנות מראש והמשלוחים לשנה זו....</p>
      <p className="mt-4 text-lg leading-8">
        ניתן להגיע ולרכוש מהמלאי הנמצא בנקודות המכירה שלנו בתיאום מראש:
      </p>
      <ul className="mx-auto mt-8 max-w-xl space-y-4 text-right text-base leading-7">
        {SEASON_CLOSED_POINTS.map((point) => (
          <li key={point.place} className="rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 py-3">
            <p className="font-semibold">{point.place}</p>
            <p>
              {point.contact}{" "}
              <a className="text-[var(--teal)]" href={phoneHref(point.phone)}>
                {point.phone}
              </a>
            </p>
            <p className="text-[var(--muted)]">{point.address}</p>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-xl font-semibold leading-8">כיף ממש להאיר לכם את הסוכה!</p>
      <p className="mt-3 text-lg leading-8">ניפגש בשנה הבאה (:</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/season-catalog.jpg"
        alt="קישוטים לסוכה תשפ״ז מאויירים בעבודת יד"
        className="mx-auto mt-10 w-full rounded-lg"
      />
    </section>
  );
}
