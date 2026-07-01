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
  await prisma.wedding.update({
    where: { id: weddingId },
    data: { rsvpCardTitle: title, rsvpCardSubtitle: subtitle },
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
  const plusOneRaw = String(formData.get("plusOneCount") || "0").trim();
  const plusOneCount = attending ? Math.max(0, Number(plusOneRaw) || 0) : 0;
  const vegetarian = formData.get("vegetarian") === "on";
  const phone = String(formData.get("phone") || "").trim() || null;
  const note = String(formData.get("note") || "").trim() || null;

  const checkinToken = crypto.randomUUID();
  await prisma.guest.create({
    data: {
      weddingId: wedding.id,
      name,
      side,
      attending,
      plusOneCount,
      vegetarian,
      phone,
      note,
      invitationStatus: "CONFIRMED",
      checkinToken,
    },
  });

  revalidatePath("/guest");
  return { ok: true as const, checkinToken, attending };
}
