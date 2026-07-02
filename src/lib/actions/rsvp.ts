"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { GuestSide } from "@/generated/prisma/enums";

export async function ensureRsvpToken(weddingId: string) {
  const wedding = await prisma.wedding.findUnique({ where: { id: weddingId } });
  if (wedding?.rsvpToken) return wedding.rsvpToken;

  const token = crypto.randomUUID();
  await prisma.wedding.update({ where: { id: weddingId }, data: { rsvpToken: token } });
  return token;
}

export async function regenerateRsvpToken(weddingId: string) {
  const token = crypto.randomUUID();
  await prisma.wedding.update({ where: { id: weddingId }, data: { rsvpToken: token } });
  revalidatePath("/guest");
  return token;
}

export async function updateRsvpCard(
  weddingId: string,
  formData: FormData
) {
  const title = String(formData.get("title") || "").trim() || null;
  const subtitle = String(formData.get("subtitle") || "").trim() || null;
  const color = String(formData.get("color") || "").trim() || null;
  await prisma.wedding.update({
    where: { id: weddingId },
    data: { rsvpCardTitle: title, rsvpCardSubtitle: subtitle, rsvpCardColor: color },
  });
  revalidatePath("/guest");
}

export async function submitRsvp(token: string, formData: FormData) {
  const wedding = await prisma.wedding.findUnique({ where: { rsvpToken: token } });
  if (!wedding) return { ok: false as const, error: "找不到這場婚禮" };

  const name = String(formData.get("name") || "").trim();
  if (!name) return { ok: false as const, error: "請填寫姓名" };

  const sideRaw = String(formData.get("side") || "");
  const side: GuestSide = sideRaw === "BRIDE" ? "BRIDE" : "GROOM";
  const attendingRaw = String(formData.get("attending") || "");
  const attending = attendingRaw === "yes" ? true : attendingRaw === "no" ? false : null;
  const attendeeRaw = String(formData.get("attendeeCount") || "1").trim();
  const attendeeCount = attending ? Math.max(1, Number(attendeeRaw) || 1) : 1;
  const plusOneCount = attendeeCount - 1;
  const vegetarianRaw = String(formData.get("vegetarianCount") || "0").trim();
  const vegetarianCount = attending ? Math.min(Math.max(0, Number(vegetarianRaw) || 0), attendeeCount) : 0;
  const note = String(formData.get("note") || "").trim() || null;

  const checkinToken = crypto.randomUUID();
  await prisma.guest.create({
    data: {
      weddingId: wedding.id,
      name,
      side,
      attending,
      plusOneCount,
      vegetarianCount,
      note,
      invitationStatus: "CONFIRMED",
      checkinToken,
    },
  });

  return { ok: true as const, checkinToken, attending };
}
