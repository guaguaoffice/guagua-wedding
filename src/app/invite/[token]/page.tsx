import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth, signIn } from "@/lib/auth";
import { getMemberships } from "@/lib/wedding";
import { joinWeddingViaInvite } from "@/lib/actions/invites";

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

  const memberships = await getMemberships();
  const alreadyMember = memberships.find((m) => m.weddingId === invite.weddingId);
  const otherWeddings = memberships.filter((m) => m.weddingId !== invite.weddingId);

  if (alreadyMember) {
    redirect("/");
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-24 text-center min-h-screen">
      <div className="w-[60px] h-[60px] rounded-2xl bg-gradient-to-br from-accent to-accent-hover grid place-items-center text-white font-display font-semibold text-2xl">
        呱
      </div>
      <div>
        <h1 className="text-xl font-bold mb-1">加入「{invite.wedding.name}」</h1>
        <p className="text-text-soft text-sm">
          將以「{ROLE_LABEL[invite.role]}」身份加入這場婚禮的規劃。
        </p>
      </div>

      {otherWeddings.length > 0 && (
        <p className="text-text-soft text-xs max-w-sm bg-card-hover rounded-[9px] px-3.5 py-2.5">
          你目前還參加：
          {otherWeddings.map((m) => m.wedding.name).join("、")}。加入後會切換顯示這一場，
          之後可以隨時在右上角的婚禮名稱切換回去。
        </p>
      )}

      <form
        action={async () => {
          "use server";
          await joinWeddingViaInvite(token);
        }}
      >
        <button type="submit" className="btn btn-primary">
          加入並切換到這場婚禮
        </button>
      </form>
    </main>
  );
}
