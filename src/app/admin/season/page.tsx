import Link from "next/link";
import { SeasonForm } from "@/components/admin/SeasonForm";
import { getContent } from "@/lib/queries";
import { isOrdersOpen } from "@/lib/store";

export default async function AdminSeasonPage() {
  const content = await getContent();
  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">סגירת הזמנות</h1>
        <p className="text-sm text-[var(--muted)]">
          כרגע ההזמנות {isOrdersOpen(content) ? "פתוחות" : "סגורות"}.
        </p>
        <Link href="/catalog" className="text-sm text-[var(--teal)]">
          צפייה בעמוד שהלקוחות רואים
        </Link>
      </div>
      <SeasonForm defaultValues={content} />
    </div>
  );
}
