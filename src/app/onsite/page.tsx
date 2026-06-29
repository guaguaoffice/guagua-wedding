import { Suspense } from "react";
import { redirect } from "next/navigation";
import { OnsiteClient } from "@/app/onsite/OnsiteClient";
import { getCurrentWedding } from "@/lib/wedding";
import { getGuests, getWeddingDayEvents } from "@/lib/queries";

export default async function OnsitePage() {
  const current = await getCurrentWedding();
  if (!current) redirect("/login");

  const [eventsRaw, guestsRaw] = await Promise.all([
    getWeddingDayEvents(current.wedding.id),
    getGuests(current.wedding.id),
  ]);

  const events = eventsRaw.map((e) => ({
    id: e.id,
    time: e.time,
    title: e.title,
    location: e.location,
    ownerName: e.ownerName,
    status: e.status,
  }));

  const guests = guestsRaw.map((g) => ({
    id: g.id,
    name: g.name,
    tableNumber: g.tableNumber,
    plusOneCount: g.plusOneCount,
  }));

  return (
    <Suspense>
      <OnsiteClient weddingId={current.wedding.id} events={events} guests={guests} />
    </Suspense>
  );
}
