"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function addTable(weddingId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const capacityRaw = String(formData.get("capacity") || "").trim();
  const capacity = capacityRaw ? Number(capacityRaw) : null;

  const count = await prisma.table.count({ where: { weddingId } });
  const col = count % 5;
  const row = Math.floor(count / 5);
  await prisma.table.create({
    data: {
      weddingId,
      name,
      capacity: capacity !== null && !Number.isNaN(capacity) ? capacity : null,
      order: count,
      x: 80 + col * 100,
      y: 80 + row * 110,
    },
  });
  revalidatePath("/onsite");
  revalidatePath("/guest");
}

export async function updateTable(tableId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const capacityRaw = String(formData.get("capacity") || "").trim();
  const capacity = capacityRaw ? Number(capacityRaw) : null;

  await prisma.table.update({
    where: { id: tableId },
    data: { name, capacity: capacity !== null && !Number.isNaN(capacity) ? capacity : null },
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

export async function updateTablePosition(tableId: string, x: number, y: number) {
  await prisma.table.update({ where: { id: tableId }, data: { x, y } });
}

export async function assignMemberTable(memberId: string, tableId: string) {
  await prisma.weddingMember.update({
    where: { id: memberId },
    data: { tableId: tableId || null },
  });
  revalidatePath("/onsite");
  revalidatePath("/guest");
  revalidatePath("/more/collaborators");
}
