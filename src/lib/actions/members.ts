"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentWedding } from "@/lib/wedding";

export async function inviteCollaborator(weddingId: string, formData: FormData) {
  const current = await getCurrentWedding();
  if (!current || current.wedding.id !== weddingId || current.role !== "OWNER") {
    return { ok: false, message: "只有主辦人可以邀請協作者" };
  }

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = String(formData.get("role") || "COLLABORATOR");
  if (!email) return { ok: false, message: "請輸入 Email" };
  if (role !== "COLLABORATOR" && role !== "VIEWER") {
    return { ok: false, message: "權限角色不正確" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return {
      ok: false,
      message: "找不到這個帳號。請對方先用 Google 登入過呱呱婚禮一次，再重新邀請。",
    };
  }

  const existing = await prisma.weddingMember.findUnique({
    where: { weddingId_userId: { weddingId, userId: user.id } },
  });
  if (existing) {
    return { ok: false, message: "這個人已經是協作者了" };
  }

  await prisma.weddingMember.create({
    data: { weddingId, userId: user.id, role },
  });

  revalidatePath("/more/collaborators");
  return { ok: true, message: `已邀請 ${user.name ?? email} 加入` };
}

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
