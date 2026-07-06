"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function checkInGuest(checkinToken: string) {
  const guest = await prisma.guest.findUnique({ where: { checkinToken } });
  if (!guest) return { ok: false as const, error: "找不到這位賓客" };
  if (guest.checkedInAt) {
    return {
      ok: true as const,
      alreadyCheckedIn: true,
      name: guest.name,
      checkedInAt: guest.checkedInAt,
    };
  }

  const updated = await prisma.guest.update({
    where: { checkinToken },
    data: { checkedInAt: new Date() },
  });

  revalidatePath("/onsite");
  revalidatePath(`/checkin/${checkinToken}`);
  return {
    ok: true as const,
    alreadyCheckedIn: false,
    name: updated.name,
    checkedInAt: updated.checkedInAt!,
  };
}

export async function toggleManualCheckin(guestId: string, checkedIn: boolean) {
  await prisma.guest.update({
    where: { id: guestId },
    data: { checkedInAt: checkedIn ? new Date() : null },
  });
  revalidatePath("/onsite");
}

export async function ensureGuestCheckinToken(guestId: string) {
  const guest = await prisma.guest.findUnique({ where: { id: guestId } });
  if (!guest) return null;
  if (guest.checkinToken) return guest.checkinToken;

  const checkinToken = crypto.randomUUID();
  await prisma.guest.update({ where: { id: guestId }, data: { checkinToken } });
  return checkinToken;
}
