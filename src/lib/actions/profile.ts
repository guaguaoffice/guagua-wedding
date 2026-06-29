"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { WeddingIdentity } from "@/generated/prisma/enums";

const IDENTITIES: WeddingIdentity[] = ["GROOM", "BRIDE", "PARTNER", "OTHER"];

export async function updateProfile(weddingId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "請先登入" };

  const name = String(formData.get("name") || "").trim();
  const identityRaw = String(formData.get("identity") || "");
  const identity = IDENTITIES.includes(identityRaw as WeddingIdentity)
    ? (identityRaw as WeddingIdentity)
    : null;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { name: name || null },
    }),
    prisma.weddingMember.update({
      where: { weddingId_userId: { weddingId, userId: session.user.id } },
      data: { identity },
    }),
  ]);

  revalidatePath("/more");
  revalidatePath("/more/collaborators");
  revalidatePath("/guest");
  return { ok: true };
}
