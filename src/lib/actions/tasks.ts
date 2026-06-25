"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function toggleTask(taskId: string, completed: boolean) {
  await prisma.timelineTask.update({
    where: { id: taskId },
    data: { completed },
  });
  revalidatePath("/plan");
  revalidatePath("/");
}

export async function addTask(weddingId: string, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  let phase = await prisma.timelinePhase.findFirst({ where: { weddingId } });
  if (!phase) {
    phase = await prisma.timelinePhase.create({
      data: { weddingId, title: "待辦事項", order: 0 },
    });
  }
  const count = await prisma.timelineTask.count({ where: { phaseId: phase.id } });
  await prisma.timelineTask.create({
    data: { phaseId: phase.id, title, order: count },
  });
  revalidatePath("/plan");
  revalidatePath("/");
}
