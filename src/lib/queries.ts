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

export async function getGuests(weddingId: string) {
  return prisma.guest.findMany({
    where: { weddingId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getTables(weddingId: string) {
  return prisma.table.findMany({
    where: { weddingId },
    orderBy: { order: "asc" },
    include: { guests: true },
  });
}

export async function getWeddingDayEvents(weddingId: string) {
  return prisma.weddingDayEvent.findMany({
    where: { weddingId },
    orderBy: { time: "asc" },
  });
}

export async function getWeddingMembers(weddingId: string) {
  return prisma.weddingMember.findMany({
    where: { weddingId },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });
}

export async function ensureInviteLinks(weddingId: string) {
  const roles = ["COLLABORATOR", "VIEWER"] as const;
  await Promise.all(
    roles.map((role) =>
      prisma.weddingInvite.upsert({
        where: { weddingId_role: { weddingId, role } },
        update: {},
        create: { weddingId, role, token: crypto.randomUUID() },
      })
    )
  );
  return prisma.weddingInvite.findMany({ where: { weddingId } });
}
