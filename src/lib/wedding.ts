import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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

/**
 * Alias for getMembership, kept for source compatibility with server actions
 * that only need the current membership and already handle a null result.
 * Does NOT auto-provision a wedding — see createOwnWedding for that.
 */
export const getCurrentWedding = getMembership;

/**
 * For page components: returns the current membership, or redirects.
 * Logged-out users go to /login; logged-in users with no wedding yet go to
 * /welcome to choose between creating their own wedding or using an invite link.
 */
export async function requireCurrentWedding() {
  const existing = await getMembership();
  if (existing) return existing;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  redirect("/welcome");
}

/** Creates a new starter wedding for the current user and makes them its owner. */
export async function createOwnWedding() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
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

  redirect("/");
}
