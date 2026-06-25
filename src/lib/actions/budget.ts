"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function addBudgetItem(weddingId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const amountRaw = String(formData.get("amount") || "").trim();
  if (!name || !amountRaw) return;
  const amount = Number(amountRaw.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(amount)) return;

  await prisma.budgetItem.create({
    data: {
      weddingId,
      name,
      category: String(formData.get("category") || "其他").trim(),
      totalAmount: amount,
    },
  });
  revalidatePath("/plan");
  revalidatePath("/");
}
