import Link from "next/link";
import { BUSINESS } from "@/lib/business";

export function Footer({ text }: { text: string }) {
  return (
    <footer className="mt-16 border-t border-[var(--line)] bg-[var(--paper)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.jpg" alt="" className="h-10 w-auto" />
        <div className="space-y-1">
          <p>{text}</p>
          <p>כתובת בית עסק: {BUSINESS.address}</p>
          <p>
            טלפון:{" "}
            <a className="hover:text-[var(--ink)]" href={BUSINESS.phoneHref}>
              {BUSINESS.phoneDisplay}
            </a>
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/terms" className="hover:text-[var(--ink)]">
            תקנון
          </Link>
          <Link href="/admin/login" className="hover:text-[var(--ink)]">
            ניהול האתר
          </Link>
        </div>
      </div>
    </footer>
  );
}
