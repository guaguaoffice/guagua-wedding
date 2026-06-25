import { prisma } from "@/lib/prisma";

export async function getDecisionItems(weddingId: string) {
  return prisma.decisionItem.findMany({
    where: { weddingId },
    orderBy: { order: "asc" },
    include: {
      candidates: { orderBy: { createdAt: "asc" } },
      decisionRecord: true,
    },
  });
}

export async function getBudgetItems(weddingId: string) {
  return prisma.budgetItem.findMany({
    where: { weddingId },
    orderBy: { createdAt: "asc" },
    include: {
      decisionItem: {
        select: { id: true, suggestedDecideBy: true, decisionRecord: true },
      },
    },
  });
}

export async function getTasks(weddingId: string) {
  return prisma.timelineTask.findMany({
    where: { phase: { weddingId } },
    orderBy: [{ completed: "asc" }, { order: "asc" }],
    include: { decisionItem: { select: { title: true } } },
  });
}
