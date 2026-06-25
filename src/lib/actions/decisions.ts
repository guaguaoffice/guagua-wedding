"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentWedding } from "@/lib/wedding";

export async function lockCandidate(decisionItemId: string, candidateId: string) {
  const current = await getCurrentWedding();
  if (!current) throw new Error("未登入");

  await prisma.$transaction(async (tx) => {
    await tx.candidate.updateMany({
      where: { decisionItemId, status: "DECIDED" },
      data: { status: "CANDIDATE" },
    });
    await tx.candidate.update({
      where: { id: candidateId },
      data: { status: "DECIDED" },
    });
    await tx.decisionRecord.deleteMany({ where: { decisionItemId } });
    await tx.decisionRecord.create({
      data: {
        decisionItemId,
        chosenCandidateId: candidateId,
        decidedById: current.userId,
      },
    });
  });

  revalidatePath("/plan");
  revalidatePath("/");
}

export async function rejectCandidate(candidateId: string, reason?: string) {
  await prisma.candidate.update({
    where: { id: candidateId },
    data: { status: "REJECTED", rejectedReason: reason || null },
  });
  revalidatePath("/plan");
}

export async function addCandidate(decisionItemId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const priceRaw = String(formData.get("price") || "").trim();
  const price = priceRaw ? Number(priceRaw.replace(/[^0-9.]/g, "")) : undefined;

  await prisma.candidate.create({
    data: {
      decisionItemId,
      name,
      price: price && !Number.isNaN(price) ? price : undefined,
      type: String(formData.get("type") || "").trim() || undefined,
    },
  });
  revalidatePath("/plan");
}

export async function addDecisionCategory(weddingId: string, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  const count = await prisma.decisionItem.count({ where: { weddingId } });
  await prisma.decisionItem.create({
    data: { weddingId, title, order: count },
  });
  revalidatePath("/plan");
}
