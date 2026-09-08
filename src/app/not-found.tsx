import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="mb-4 text-3xl font-bold">העמוד לא נמצא</h1>
      <Link href="/" className="btn-primary">
        חזרה לדף הבית
      </Link>
    </main>
  );
}
