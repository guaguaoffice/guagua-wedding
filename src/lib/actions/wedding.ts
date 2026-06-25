"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ACTIVE_WEDDING_COOKIE, getCurrentWedding } from "@/lib/wedding";

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
  revalidatePath("/more/event");
  return { ok: true, message: "已更新婚禮資訊" };
}
