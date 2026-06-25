import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth, signIn } from "@/lib/auth";
import { getMembership } from "@/lib/wedding";

const ROLE_LABEL: Record<string, string> = {
  COLLABORATOR: "協作者",
  VIEWER: "檢視者",
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invite = await prisma.weddingInvite.findUnique({
    where: { token },
    include: { wedding: { select: { id: true, name: true } } },
  });

  if (!invite) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-24 text-center min-h-screen">
        <h1 className="text-xl font-bold">邀請連結無效</h1>
        <p className="text-text-soft text-sm max-w-sm">
          這個邀請連結可能已經失效或被重新產生過，請向主辦人要最新的連結。
        </p>
      </main>
    );
  }

  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-24 text-center min-h-screen">
        <div className="w-[60px] h-[60px] rounded-2xl bg-gradient-to-br from-accent to-accent-hover grid place-items-center text-white font-display font-semibold text-2xl">
          呱
        </div>
        <div>
          <h1 className="text-xl font-bold mb-1">加入「{invite.wedding.name}」</h1>
          <p className="text-text-soft text-sm">
            登入後即可以「{ROLE_LABEL[invite.role]}」身份加入這場婚禮的規劃。
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: `/invite/${token}` });
          }}
        >
          <button type="submit" className="btn btn-primary">
            使用 Google 登入並加入
          </button>
        </form>
      </main>
    );
  }

  const existing = await getMembership();
  if (!existing) {
    await prisma.weddingMember.create({
      data: { weddingId: invite.weddingId, userId: session.user.id, role: invite.role },
    });
  } else if (existing.wedding.id !== invite.weddingId) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-24 text-center min-h-screen">
        <h1 className="text-xl font-bold">你已經有一場婚禮了</h1>
        <p className="text-text-soft text-sm max-w-sm">
          目前帳號已經屬於「{existing.wedding.name}」，呱呱婚禮目前還不支援同時加入多場婚禮。
        </p>
      </main>
    );
  }

  redirect("/");
}
