import { parseClosedPoints } from "@/lib/store";

function phoneHref(phone: string) {
  return `tel:${phone.replace(/\D/g, "")}`;
}

type Content = {
  closed_title: string;
  closed_intro: string;
  closed_points: string;
  closed_outro: string;
  closed_top_image: string;
  closed_bottom_image: string;
};

export function ClosedNotice({ content }: { content: Content }) {
  const intro = content.closed_intro.split("\n").filter(Boolean);
  const outro = content.closed_outro.split("\n").filter(Boolean);
  const points = parseClosedPoints(content.closed_points);

  return (
    <section className="mx-auto max-w-4xl px-5 py-10 text-center">
      {content.closed_top_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={content.closed_top_image}
          alt=""
          className="mx-auto w-full max-w-md"
        />
      ) : null}
      <h1 className="mt-8 text-3xl font-bold text-[var(--teal)] sm:text-4xl">{content.closed_title}</h1>
      {intro.map((line) => (
        <p key={line} className="mt-5 text-lg leading-8">
          {line}
        </p>
      ))}
      {points.length > 0 ? (
        <ul className="mx-auto mt-8 max-w-xl space-y-4 text-right text-base leading-7">
          {points.map((point) => (
            <li key={`${point.place}-${point.phone}`} className="rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 py-3">
              <p className="font-semibold">{point.place}</p>
              <p>
                {point.contact}
                {point.phone ? (
                  <>
                    {" "}
                    <a className="text-[var(--teal)]" href={phoneHref(point.phone)}>
                      {point.phone}
                    </a>
                  </>
                ) : null}
              </p>
              {point.address ? <p className="text-[var(--muted)]">{point.address}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {outro.map((line, index) => (
        <p
          key={line}
          className={index === 0 ? "mt-10 text-xl font-semibold leading-8" : "mt-3 text-lg leading-8"}
        >
          {line}
        </p>
      ))}
      {content.closed_bottom_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={content.closed_bottom_image}
          alt=""
          className="mx-auto mt-10 w-full rounded-lg"
        />
      ) : null}
    </section>
  );
}
