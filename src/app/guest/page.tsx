import { Suspense } from "react";
import { redirect } from "next/navigation";
import { GuestClient } from "@/app/guest/GuestClient";
import { getCurrentWedding } from "@/lib/wedding";
import { getGuests } from "@/lib/queries";
import { toNumOrNull } from "@/lib/decimal";
import { ensureRsvpToken } from "@/lib/actions/rsvp";

export default async function GuestPage() {
  const current = await getCurrentWedding();
  if (!current) redirect("/login");

  const [guestsRaw, rsvpToken] = await Promise.all([
    getGuests(current.wedding.id),
    ensureRsvpToken(current.wedding.id),
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

  return (
    <Suspense>
      <GuestClient weddingId={current.wedding.id} guests={guests} rsvpToken={rsvpToken} />
    </Suspense>
  );
}
