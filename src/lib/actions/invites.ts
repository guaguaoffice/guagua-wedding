"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ACTIVE_WEDDING_COOKIE, getCurrentWedding } from "@/lib/wedding";

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

export async function joinWeddingViaInvite(token: string) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "請先登入" };

  const invite = await prisma.weddingInvite.findUnique({ where: { token } });
  if (!invite) return { ok: false, message: "邀請連結無效" };

  const existing = await prisma.weddingMember.findUnique({
    where: { weddingId_userId: { weddingId: invite.weddingId, userId: session.user.id } },
  });
  if (!existing) {
    await prisma.weddingMember.create({
      data: { weddingId: invite.weddingId, userId: session.user.id, role: invite.role },
    });
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WEDDING_COOKIE, invite.weddingId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect("/");
}
