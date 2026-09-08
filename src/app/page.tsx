import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getContent } from "@/lib/queries";

export default async function HomePage() {
  const content = await getContent();
  const paragraphs = content.about_body.split("\n").filter(Boolean);

  return (
    <div className="min-h-screen">
      <Header logo={content.logo_text} />
      <main>
        <section className="px-5 pt-10 text-center">
          <h1 className="mx-auto max-w-3xl text-3xl font-bold text-[var(--teal)] sm:text-5xl">
            {content.hero_title}
          </h1>
        </section>

        <section className="relative mx-auto mt-8 max-w-6xl overflow-hidden px-5">
          <div className="relative overflow-hidden rounded-lg bg-[var(--paper)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero.jpg"
              alt="קישוטי סוכה מאויירים בעבודת יד, תלויים עם עץ ומתלה"
              className="h-[360px] w-full object-cover object-center sm:h-[520px]"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/15">
              <Link href="/catalog" className="btn-primary text-lg shadow-lg">
                {content.catalog_cta}
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-8 grid max-w-6xl gap-4 px-5 sm:grid-cols-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/atmosphere-1.jpg"
            alt="קישוטים תלויים בסוכה עם איורי פרחים ורימונים"
            className="h-64 w-full rounded-lg object-cover sm:h-80"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/atmosphere-2.jpg"
            alt="קישוט ופרוש עלינו סוכת שלומך מקרוב, עם עץ ומתלה"
            className="h-64 w-full rounded-lg object-cover sm:h-80"
          />
        </section>

        <section className="mx-auto mt-14 max-w-3xl px-5 text-center">
          <h2 className="mb-6 text-3xl font-bold">{content.about_title}</h2>
          <div className="space-y-3 text-lg leading-8 text-[#333]">
            {paragraphs.map((line) => (
              <p key={line} className={line.includes("השנה") ? "text-xl font-semibold" : undefined}>
                {line}
              </p>
            ))}
          </div>
          <p className="mt-8 text-sm text-[var(--muted)]">
            2 בדים גדולים ב-200 ₪ · 2 בדים קטנים ב-150 ₪ · 2 מנויילנים ב-50 ₪
          </p>
          <Link href="/catalog" className="btn-primary mt-6">
            {content.catalog_cta}
          </Link>
        </section>
      </main>
      <Footer text={content.footer_text} />
    </div>
  );
}
