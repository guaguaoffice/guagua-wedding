import { Suspense } from "react";
import { GuestClient } from "@/app/guest/GuestClient";
import { requireCurrentWedding } from "@/lib/wedding";
import { getGuests, getTables } from "@/lib/queries";
import { toNumOrNull } from "@/lib/decimal";
import { ensureRsvpToken } from "@/lib/actions/rsvp";

export default async function GuestPage() {
  const current = await requireCurrentWedding();

  const [guestsRaw, rsvpToken, tablesRaw] = await Promise.all([
    getGuests(current.wedding.id),
    ensureRsvpToken(current.wedding.id),
    getTables(current.wedding.id),
  ]);

  const { rsvpCardTitle, rsvpCardSubtitle, rsvpCardImageUrl, rsvpCardColor } = current.wedding;
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
    checkinToken: g.checkinToken,
  }));
  const tables = tablesRaw.map((t) => ({ id: t.id, name: t.name, capacity: t.capacity }));

  return (
    <Suspense>
      <GuestClient
        weddingId={current.wedding.id}
        guests={guests}
        rsvpToken={rsvpToken}
        tables={tables}
        rsvpCardTitle={rsvpCardTitle}
        rsvpCardSubtitle={rsvpCardSubtitle}
        rsvpCardImageUrl={rsvpCardImageUrl}
        rsvpCardColor={rsvpCardColor}
      />
    </Suspense>
  );
}
