"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentWedding } from "@/lib/wedding";
import type { CandidateAvailability } from "@/generated/prisma/enums";

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

function parseCandidateFields(formData: FormData) {
  const priceRaw = String(formData.get("price") || "").trim();
  const price = priceRaw ? Number(priceRaw.replace(/[^0-9.]/g, "")) : null;
  const availabilityRaw = String(formData.get("availability") || "").trim();
  const availability: CandidateAvailability | null =
    availabilityRaw === "OK" || availabilityRaw === "WAIT" || availabilityRaw === "CONFLICT"
      ? availabilityRaw
      : null;

  return {
    type: String(formData.get("type") || "").trim() || null,
    price: price !== null && !Number.isNaN(price) ? price : null,
    note: String(formData.get("note") || "").trim() || null,
    tag: String(formData.get("tag") || "").trim() || null,
    pros: String(formData.get("pros") || "").trim() || null,
    cons: String(formData.get("cons") || "").trim() || null,
    availability,
  };
}

export async function addCandidate(decisionItemId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;

  await prisma.candidate.create({
    data: { decisionItemId, name, ...parseCandidateFields(formData) },
  });
  revalidatePath("/plan");
}

export async function updateCandidate(candidateId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;

  await prisma.candidate.update({
    where: { id: candidateId },
    data: { name, ...parseCandidateFields(formData) },
  });
  revalidatePath("/plan");
}

export async function addDecisionCategory(weddingId: string, formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  const category = String(formData.get("category") || "").trim() || null;
  const decideByRaw = String(formData.get("decideBy") || "").trim();
  const monthsRaw = String(formData.get("months") || "").trim();

  let suggestedDecideBy: Date | null = decideByRaw ? new Date(decideByRaw) : null;
  if (!suggestedDecideBy && monthsRaw) {
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

export async function updateDecisionDate(decisionItemId: string, decideByRaw: string) {
  await prisma.decisionItem.update({
    where: { id: decisionItemId },
    data: { suggestedDecideBy: decideByRaw ? new Date(decideByRaw) : null },
  });
  revalidatePath("/plan");
  revalidatePath("/");
  return { ok: true };
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
