"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ACTIVE_WEDDING_COOKIE, getCurrentWedding } from "@/lib/wedding";

async function switchToAnotherMembershipOrClear(userId: string) {
  const remaining = await prisma.weddingMember.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  const cookieStore = await cookies();
  if (remaining) {
    cookieStore.set(ACTIVE_WEDDING_COOKIE, remaining.weddingId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  } else {
    cookieStore.delete(ACTIVE_WEDDING_COOKIE);
  }
}

export async function createWedding(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const name = String(formData.get("name") || "").trim();
  if (!name) return { ok: false as const, message: "請輸入活動名稱" };

  const wedding = await prisma.wedding.create({
    data: {
      name,
      members: {
        create: { userId: session.user.id, role: "OWNER" },
      },
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WEDDING_COOKIE, wedding.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect("/");
}

export async function setActiveWedding(weddingId: string) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "請先登入" };

  const membership = await prisma.weddingMember.findUnique({
    where: { weddingId_userId: { weddingId, userId: session.user.id } },
  });
  if (!membership) return { ok: false, message: "你不是這場婚禮的成員" };

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WEDDING_COOKIE, weddingId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/");
  return { ok: true, message: "已切換婚禮" };
}

export async function updateWeddingInfo(weddingId: string, formData: FormData) {
  const current = await getCurrentWedding();
  if (!current || current.wedding.id !== weddingId) throw new Error("未登入");

  const name = String(formData.get("name") || "").trim();
  if (!name) return { ok: false, message: "請輸入婚禮名稱" };

  const weddingDateRaw = String(formData.get("weddingDate") || "").trim();
  const venueName = String(formData.get("venueName") || "").trim();
  const venueDetail = String(formData.get("venueDetail") || "").trim();
  const totalBudgetRaw = String(formData.get("totalBudget") || "").trim();
  const totalBudget = totalBudgetRaw ? Number(totalBudgetRaw.replace(/[^0-9.]/g, "")) : null;

  await prisma.wedding.update({
    where: { id: weddingId },
    data: {
      name,
      weddingDate: weddingDateRaw ? new Date(weddingDateRaw) : null,
      venueName: venueName || null,
      venueDetail: venueDetail || null,
      totalBudget:
        totalBudget !== null && !Number.isNaN(totalBudget) ? totalBudget : null,
    },
  });

  revalidatePath("/");
  revalidatePath("/plan");
  revalidatePath("/more");
  return { ok: true, message: "已更新婚禮資訊" };
}

export async function transferOwnership(weddingId: string, newOwnerUserId: string) {
  const current = await getCurrentWedding();
  if (!current || current.wedding.id !== weddingId || current.role !== "OWNER") {
    return { ok: false, message: "只有主辦人可以轉移主辦權" };
  }
  if (newOwnerUserId === current.userId) {
    return { ok: false, message: "對方已經是主辦人" };
  }

  const target = await prisma.weddingMember.findUnique({
    where: { weddingId_userId: { weddingId, userId: newOwnerUserId } },
  });
  if (!target) return { ok: false, message: "對方不是這場婚禮的成員" };

  await prisma.$transaction([
    prisma.weddingMember.update({ where: { id: target.id }, data: { role: "OWNER" } }),
    prisma.weddingMember.update({
      where: { weddingId_userId: { weddingId, userId: current.userId } },
      data: { role: "COLLABORATOR" },
    }),
  ]);

  revalidatePath("/more");
  return { ok: true, message: "已轉移主辦權" };
}

export async function leaveWedding(weddingId: string) {
  const current = await getCurrentWedding();
  if (!current || current.wedding.id !== weddingId) {
    return { ok: false, message: "你不是這場婚禮的成員" };
  }
  if (current.role === "OWNER") {
    return { ok: false, message: "主辦人無法直接離開，請先轉移主辦權或刪除婚禮" };
  }

  await prisma.weddingMember.delete({
    where: { weddingId_userId: { weddingId, userId: current.userId } },
  });
  await switchToAnotherMembershipOrClear(current.userId);

  redirect("/");
}

export async function deleteWedding(weddingId: string) {
  const current = await getCurrentWedding();
  if (!current || current.wedding.id !== weddingId || current.role !== "OWNER") {
    return { ok: false, message: "只有主辦人可以刪除婚禮" };
  }

  await prisma.wedding.delete({ where: { id: weddingId } });
  await switchToAnotherMembershipOrClear(current.userId);

  redirect("/");
}
