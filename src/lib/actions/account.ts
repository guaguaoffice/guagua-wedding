"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ACTIVE_WEDDING_COOKIE } from "@/lib/wedding";

export async function deleteAccount(): Promise<{ ok: false; message: string } | never> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  // 檢查是否有婚禮是唯一主辦人且還有其他成員
  const ownedWeddings = await prisma.weddingMember.findMany({
    where: { userId, role: "OWNER" },
    include: {
      wedding: {
        include: { members: { select: { id: true } } },
      },
    },
  });

  const blocked = ownedWeddings.filter((m) => m.wedding.members.length > 1);
  if (blocked.length > 0) {
    const names = blocked.map((m) => `「${m.wedding.name}」`).join("、");
    return {
      ok: false,
      message: `請先轉移以下婚禮的主辦人或移除所有協作者後再刪除帳號：${names}`,
    };
  }

  // 刪除使用者獨自擁有的婚禮（cascade 會清除所有子資料）
  const soloWeddingIds = ownedWeddings
    .filter((m) => m.wedding.members.length === 1)
    .map((m) => m.weddingId);

  if (soloWeddingIds.length > 0) {
    await prisma.wedding.deleteMany({ where: { id: { in: soloWeddingIds } } });
  }

  // 刪除使用者（cascade 清除 Account、Session、WeddingMember）
  await prisma.user.delete({ where: { id: userId } });

  // 清除 cookie 後登出
  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_WEDDING_COOKIE);

  await signOut({ redirect: false });
  redirect("/login");
}
