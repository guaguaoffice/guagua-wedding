"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentWedding } from "@/lib/wedding";

export async function updateMemberRole(memberId: string, role: "COLLABORATOR" | "VIEWER") {
  const member = await prisma.weddingMember.findUniqueOrThrow({ where: { id: memberId } });
  const current = await getCurrentWedding();
  if (!current || current.wedding.id !== member.weddingId || current.role !== "OWNER") {
    return { ok: false, message: "只有主辦人可以修改權限" };
  }
  if (member.role === "OWNER") {
    return { ok: false, message: "無法修改主辦人的權限" };
  }

  await prisma.weddingMember.update({ where: { id: memberId }, data: { role } });
  revalidatePath("/more/collaborators");
  return { ok: true, message: "已更新權限" };
}

export async function removeMember(memberId: string) {
  const member = await prisma.weddingMember.findUniqueOrThrow({ where: { id: memberId } });
  const current = await getCurrentWedding();
  if (!current || current.wedding.id !== member.weddingId || current.role !== "OWNER") {
    return { ok: false, message: "只有主辦人可以移除協作者" };
  }
  if (member.role === "OWNER") {
    return { ok: false, message: "無法移除主辦人" };
  }

  await prisma.weddingMember.delete({ where: { id: memberId } });
  revalidatePath("/more/collaborators");
  return { ok: true, message: "已移除" };
}
