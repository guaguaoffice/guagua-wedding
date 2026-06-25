"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentWedding } from "@/lib/wedding";

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
