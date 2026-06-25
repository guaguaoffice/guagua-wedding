import { cache } from "react";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { seedDefaultWeddingData } from "@/lib/seed-wedding";

export const ACTIVE_WEDDING_COOKIE = "activeWeddingId";

/** All weddings the current user belongs to, oldest first. */
export const getMemberships = cache(async function getMemberships() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.weddingMember.findMany({
    where: { userId: session.user.id },
    include: { wedding: true },
    orderBy: { createdAt: "asc" },
  });
});

/** Read-only: returns the user's active membership, without creating anything. */
export const getMembership = cache(async function getMembership() {
  const memberships = await getMemberships();
  if (memberships.length === 0) return null;

  const cookieStore = await cookies();
  const activeId = cookieStore.get(ACTIVE_WEDDING_COOKIE)?.value;
  const active = (activeId && memberships.find((m) => m.weddingId === activeId)) || memberships[0];

  return { userId: active.userId, wedding: active.wedding, role: active.role };
});

/** Ensures the user has a wedding, auto-provisioning a starter one if they have none yet. */
export const getCurrentWedding = cache(async function getCurrentWedding() {
  const existing = await getMembership();
  if (existing) return existing;

  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

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

  return { userId, wedding, role: "OWNER" as const };
});
