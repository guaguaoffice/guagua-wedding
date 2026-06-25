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
  const category = String(formData.get("category") || "").trim() || null;
  const monthsRaw = String(formData.get("months") || "").trim();

  let suggestedDecideBy: Date | null = null;
  if (monthsRaw) {
    const months = Number(monthsRaw);
    const current = await getCurrentWedding();
    if (!Number.isNaN(months) && current?.wedding.weddingDate) {
      suggestedDecideBy = new Date(
        current.wedding.weddingDate.getTime() - months * 30.4 * 1000 * 60 * 60 * 24
      );
    }
  }

  const count = await prisma.decisionItem.count({ where: { weddingId } });
  await prisma.decisionItem.create({
    data: { weddingId, title, category, order: count, suggestedDecideBy },
  });
  revalidatePath("/plan");
}

export async function addVendorToCandidates(
  weddingId: string,
  vendor: { decisionTitle: string; category: string; name: string; type: string; priceLabel: string }
) {
  let item = await prisma.decisionItem.findFirst({
    where: { weddingId, title: vendor.decisionTitle },
  });
  if (!item) {
    const count = await prisma.decisionItem.count({ where: { weddingId } });
    item = await prisma.decisionItem.create({
      data: { weddingId, title: vendor.decisionTitle, category: vendor.category, order: count },
    });
  }

  await prisma.candidate.create({
    data: {
      decisionItemId: item.id,
      name: vendor.name,
      type: vendor.type,
      note: vendor.priceLabel,
    },
  });

  revalidatePath("/plan");
  revalidatePath("/");
  return { ok: true, decisionItemId: item.id };
}

export async function removeDecisionCategory(decisionItemId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.timelineTask.updateMany({
      where: { decisionItemId },
      data: { decisionItemId: null },
    });
    await tx.budgetItem.updateMany({
      where: { decisionItemId },
      data: { decisionItemId: null },
    });
    await tx.fileAsset.updateMany({
      where: { decisionItemId },
      data: { decisionItemId: null },
    });
    await tx.inspirationItem.updateMany({
      where: { decisionItemId },
      data: { decisionItemId: null },
    });
    await tx.decisionItem.delete({ where: { id: decisionItemId } });
  });
  revalidatePath("/plan");
  revalidatePath("/");
}
