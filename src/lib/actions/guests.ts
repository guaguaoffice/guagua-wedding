"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { GuestSide } from "@/generated/prisma/enums";

export async function addGuest(weddingId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const sideRaw = String(formData.get("side") || "GROOM");
  const side: GuestSide = sideRaw === "BRIDE" ? "BRIDE" : "GROOM";
  const relation = String(formData.get("relation") || "").trim() || null;

  await prisma.guest.create({
    data: { weddingId, name, side, relation, checkinToken: crypto.randomUUID() },
  });
  revalidatePath("/guest");
}

export async function deleteGuest(guestId: string) {
  await prisma.guest.delete({ where: { id: guestId } });
  revalidatePath("/guest");
}

export async function setGuestAttending(guestId: string, attending: boolean | null) {
  await prisma.guest.update({ where: { id: guestId }, data: { attending } });
  revalidatePath("/guest");
}

export async function setGuestGift(guestId: string, amountRaw: string) {
  const amount = amountRaw.trim() ? Number(amountRaw.replace(/[^0-9.]/g, "")) : null;
  await prisma.guest.update({
    where: { id: guestId },
    data: { giftAmount: amount !== null && !Number.isNaN(amount) ? amount : null },
  });
  revalidatePath("/guest");
}
