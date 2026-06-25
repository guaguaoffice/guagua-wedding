"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentWedding } from "@/lib/wedding";

export async function regenerateInviteLink(
  weddingId: string,
  role: "COLLABORATOR" | "VIEWER"
) {
  const current = await getCurrentWedding();
  if (!current || current.wedding.id !== weddingId || current.role !== "OWNER") {
    return { ok: false, message: "只有主辦人可以重新產生邀請連結" };
  }

  await prisma.weddingInvite.upsert({
    where: { weddingId_role: { weddingId, role } },
    update: { token: crypto.randomUUID() },
    create: { weddingId, role, token: crypto.randomUUID() },
  });

  revalidatePath("/more/collaborators");
  return { ok: true, message: "已產生新連結，舊連結將失效" };
}
