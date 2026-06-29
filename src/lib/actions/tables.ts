"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function addTable(weddingId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const capacityRaw = String(formData.get("capacity") || "").trim();
  const capacity = capacityRaw ? Number(capacityRaw) : null;

  const count = await prisma.table.count({ where: { weddingId } });
  await prisma.table.create({
    data: {
      weddingId,
      name,
      capacity: capacity !== null && !Number.isNaN(capacity) ? capacity : null,
      order: count,
    },
  });
  revalidatePath("/onsite");
  revalidatePath("/guest");
}

export async function deleteTable(tableId: string) {
  await prisma.table.delete({ where: { id: tableId } });
  revalidatePath("/onsite");
  revalidatePath("/guest");
}

export async function assignGuestTable(guestId: string, tableId: string) {
  await prisma.guest.update({
    where: { id: guestId },
    data: { tableId: tableId || null },
  });
  revalidatePath("/onsite");
  revalidatePath("/guest");
}
