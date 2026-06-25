import { redirect } from "next/navigation";
import { getCurrentWedding } from "@/lib/wedding";
import { ensureInviteLinks, getWeddingMembers } from "@/lib/queries";
import { BackToMore } from "@/components/BackToMore";
import { CollaboratorsClient } from "@/app/more/collaborators/CollaboratorsClient";
import { InviteLinks } from "@/app/more/collaborators/InviteLinks";

export default async function CollaboratorsPage() {
  const current = await getCurrentWedding();
  if (!current) redirect("/login");

  const isOwner = current.role === "OWNER";
  const [members, invites] = await Promise.all([
    getWeddingMembers(current.wedding.id),
    isOwner ? ensureInviteLinks(current.wedding.id) : Promise.resolve([]),
  ]);

  return (
    <div className="animate-fade-in">
      <BackToMore />
      <div className="text-[11px] tracking-[0.16em] uppercase text-accent-hover font-bold">
        更多
      </div>
      <h1 className="text-[25px] md:text-[30px] font-bold tracking-tight mt-0.5 mb-3">
        協作者管理
      </h1>
      <p className="text-text-soft text-sm mb-4">邀請家人或婚顧一起規劃這場婚禮。</p>

      <div className="flex flex-col gap-6 max-w-lg">
        {isOwner && (
          <InviteLinks
            weddingId={current.wedding.id}
            invites={invites.map((i) => ({
              role: i.role as "COLLABORATOR" | "VIEWER",
              token: i.token,
            }))}
          />
        )}
        <CollaboratorsClient members={members} isOwner={isOwner} />
      </div>
    </div>
  );
}
