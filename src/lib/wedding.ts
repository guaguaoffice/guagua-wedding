import { cache } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { seedDefaultWeddingData } from "@/lib/seed-wedding";

export const getCurrentWedding = cache(async function getCurrentWedding() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  let member = await prisma.weddingMember.findFirst({
    where: { userId },
    include: { wedding: true },
    orderBy: { createdAt: "asc" },
  });

  if (!member) {
    const wedding = await prisma.wedding.create({
      data: {
        name: "我的婚禮",
        weddingDate: new Date("2027-04-24"),
        venueName: "晶華酒店 · 宴會廳",
        venueDetail: "12:00 午宴 · 預估 12 桌 / 120 人",
        totalBudget: 650000,
        members: { create: { userId, role: "OWNER" } },
      },
    });
    await seedDefaultWeddingData(wedding.id, userId);
    member = await prisma.weddingMember.findFirstOrThrow({
      where: { userId, weddingId: wedding.id },
      include: { wedding: true },
    });
  }

  return { userId, wedding: member.wedding, role: member.role };
});
