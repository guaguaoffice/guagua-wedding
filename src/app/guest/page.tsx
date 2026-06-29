import { Suspense } from "react";
import { GuestClient } from "@/app/guest/GuestClient";
import { requireCurrentWedding } from "@/lib/wedding";
import { getGuests, getWeddingMembers } from "@/lib/queries";
import { toNumOrNull } from "@/lib/decimal";
import { ensureRsvpToken } from "@/lib/actions/rsvp";

export default async function GuestPage() {
  const current = await requireCurrentWedding();

  const [guestsRaw, rsvpToken, membersRaw] = await Promise.all([
    getGuests(current.wedding.id),
    ensureRsvpToken(current.wedding.id),
    getWeddingMembers(current.wedding.id),
  ]);
  const guests = guestsRaw.map((g) => ({
    id: g.id,
    name: g.name,
    side: g.side,
    relation: g.relation,
    phone: g.phone,
    attending: g.attending,
    plusOneCount: g.plusOneCount,
    tableNumber: g.tableNumber,
    giftAmount: toNumOrNull(g.giftAmount),
  }));
  const collaborators = membersRaw.map((m) => ({
    id: m.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
  }));

  return (
    <Suspense>
      <GuestClient
        weddingId={current.wedding.id}
        guests={guests}
        rsvpToken={rsvpToken}
        collaborators={collaborators}
      />
    </Suspense>
  );
}
