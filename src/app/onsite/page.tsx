import { Suspense } from "react";
import { OnsiteClient } from "@/app/onsite/OnsiteClient";
import { requireCurrentWedding } from "@/lib/wedding";
import { getGuests, getTables, getWeddingDayEvents, getWeddingMembers } from "@/lib/queries";

export default async function OnsitePage() {
  const current = await requireCurrentWedding();

  const [eventsRaw, guestsRaw, tablesRaw, membersRaw] = await Promise.all([
    getWeddingDayEvents(current.wedding.id),
    getGuests(current.wedding.id),
    getTables(current.wedding.id),
    getWeddingMembers(current.wedding.id),
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
    kind: "guest" as const,
  }));

  const members = membersRaw.map((m) => ({
    id: m.id,
    name: m.user.name ?? m.user.email,
    tableId: m.tableId,
    plusOneCount: 0,
    kind: "member" as const,
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
        guests={[...guests, ...members]}
        tables={tables}
      />
    </Suspense>
  );
}
