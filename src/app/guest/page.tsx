import { Suspense } from "react";
import { GuestClient } from "@/app/guest/GuestClient";
import { requireCurrentWedding } from "@/lib/wedding";
import { getGuests, getTables, getWeddingMembers } from "@/lib/queries";
import { toNumOrNull } from "@/lib/decimal";
import { ensureRsvpToken } from "@/lib/actions/rsvp";

export default async function GuestPage() {
  const current = await requireCurrentWedding();

  const [guestsRaw, rsvpToken, membersRaw, tablesRaw] = await Promise.all([
    getGuests(current.wedding.id),
    ensureRsvpToken(current.wedding.id),
    getWeddingMembers(current.wedding.id),
    getTables(current.wedding.id),
  ]);
  const guests = guestsRaw.map((g) => ({
    id: g.id,
    name: g.name,
    side: g.side,
    relation: g.relation,
    phone: g.phone,
    attending: g.attending,
    plusOneCount: g.plusOneCount,
    tableId: g.tableId,
    giftAmount: toNumOrNull(g.giftAmount),
  }));
  const collaborators = membersRaw.map((m) => ({
    id: m.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    identity: m.identity,
  }));
  const tables = tablesRaw.map((t) => ({ id: t.id, name: t.name }));

  return (
    <Suspense>
      <GuestClient
        weddingId={current.wedding.id}
        guests={guests}
        rsvpToken={rsvpToken}
        collaborators={collaborators}
        tables={tables}
      />
    </Suspense>
  );
}
