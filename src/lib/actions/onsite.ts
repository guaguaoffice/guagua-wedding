"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { WeddingDayEventStatus } from "@/generated/prisma/enums";

export async function addWeddingDayEvent(weddingId: string, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const timeRaw = String(formData.get("time") || "").trim();
  if (!title || !timeRaw) return;

  const [hours, minutes] = timeRaw.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return;

  const wedding = await prisma.wedding.findUnique({ where: { id: weddingId } });
  const baseDate = wedding?.weddingDate ?? new Date();
  const time = new Date(baseDate);
  time.setHours(hours, minutes, 0, 0);

  await prisma.weddingDayEvent.create({
    data: {
      weddingId,
      title,
      time,
      location: String(formData.get("location") || "").trim() || null,
      ownerName: String(formData.get("ownerName") || "").trim() || null,
    },
  });
  revalidatePath("/onsite");
}

export async function cycleWeddingDayEventStatus(eventId: string, current: WeddingDayEventStatus) {
  const next: WeddingDayEventStatus =
    current === "PENDING" ? "IN_PROGRESS" : current === "IN_PROGRESS" ? "DONE" : "PENDING";
  await prisma.weddingDayEvent.update({ where: { id: eventId }, data: { status: next } });
  revalidatePath("/onsite");
}

export async function deleteWeddingDayEvent(eventId: string) {
  await prisma.weddingDayEvent.delete({ where: { id: eventId } });
  revalidatePath("/onsite");
}
