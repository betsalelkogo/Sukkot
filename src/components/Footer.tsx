import Link from "next/link";

export function Footer({ text }: { text: string }) {
  return (
    <footer className="mt-16 border-t border-[var(--line)] bg-[var(--paper)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.jpg" alt="" className="h-10 w-auto" />
        <p>{text}</p>
        <Link href="/admin/login" className="hover:text-[var(--ink)]">
          ניהול האתר
        </Link>
      </div>
    </footer>
  );
}
