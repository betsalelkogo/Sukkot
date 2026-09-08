import { PickupPointsManager } from "@/components/admin/PickupPointsManager";
import { getPickupPoints } from "@/lib/queries";

export default async function AdminPickupPointsPage() {
  const points = await getPickupPoints();
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">נקודות איסוף</h1>
      <p className="text-sm text-[var(--muted)]">
        הלקוחות בוחרים נקודת איסוף בקופה. אין צורך בכתובת למשלוח.
      </p>
      <PickupPointsManager points={points} />
    </div>
  );
}
