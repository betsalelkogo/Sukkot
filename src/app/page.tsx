import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroVideo } from "@/components/HeroVideo";
import { getContent } from "@/lib/queries";

export default async function HomePage() {
  const content = await getContent();
  const paragraphs = content.about_body.split("\n").filter(Boolean);

  return (
    <div className="min-h-screen">
      <Header logo={content.logo_text} />
      <main>
        <section className="relative overflow-hidden">
          <div className="relative min-h-[calc(100svh-5.75rem)] sm:min-h-[calc(100svh-7rem)]">
            <HeroVideo src="/images/hero.mp4" poster="/images/hero.jpg" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/55" />
            <div className="relative z-10 flex min-h-[calc(100svh-5.75rem)] flex-col items-center justify-end px-5 pb-12 text-center sm:min-h-[calc(100svh-7rem)] sm:pb-16">
              <h1 className="mx-auto max-w-3xl text-3xl font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:text-5xl">
                {content.hero_title}
              </h1>
              <Link href="/catalog" className="btn-primary mt-6 text-lg shadow-lg">
                {content.catalog_cta}
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-6xl px-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/atmosphere-1.jpg"
            alt="קישוטים תלויים בסוכה עם איורי פרחים ורימונים"
            className="w-full rounded-lg"
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/atmosphere-2.jpg"
            alt="קישוט ופרוש עלינו סוכת שלומך מקרוב, עם עץ ומתלה"
            className="mt-8 w-full rounded-lg object-contain object-top"
          />
          <Link href="/catalog" className="btn-primary mt-6">
            {content.catalog_cta}
          </Link>
        </section>
      </main>
      <Footer text={content.footer_text} />
    </div>
  );
}
