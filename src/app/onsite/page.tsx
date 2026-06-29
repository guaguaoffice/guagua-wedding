import { Suspense } from "react";
import { OnsiteClient } from "@/app/onsite/OnsiteClient";
import { requireCurrentWedding } from "@/lib/wedding";
import { getGuests, getTables, getWeddingDayEvents } from "@/lib/queries";

export default async function OnsitePage() {
  const current = await requireCurrentWedding();

  const [eventsRaw, guestsRaw, tablesRaw] = await Promise.all([
    getWeddingDayEvents(current.wedding.id),
    getGuests(current.wedding.id),
    getTables(current.wedding.id),
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
    tableId: g.tableId,
    plusOneCount: g.plusOneCount,
  }));

  const tables = tablesRaw.map((t) => ({
    id: t.id,
    name: t.name,
    capacity: t.capacity,
  }));

  return (
    <Suspense>
      <OnsiteClient
        weddingId={current.wedding.id}
        events={events}
        guests={guests}
        tables={tables}
      />
    </Suspense>
  );
}
