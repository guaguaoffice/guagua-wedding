import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentWedding, getMemberships } from "@/lib/wedding";
import { getWeddingMembers } from "@/lib/queries";
import { auth, signOut } from "@/lib/auth";
import { toNumOrNull } from "@/lib/decimal";
import { WeddingListSwitcher } from "@/app/more/WeddingListSwitcher";
import { EventForm } from "@/app/more/EventForm";
import { AccountSection } from "@/app/more/AccountSection";

export default async function MorePage() {
  const current = await getCurrentWedding();
  if (!current) redirect("/login");

  const isOwner = current.role === "OWNER";
  const [session, memberships, members] = await Promise.all([
    auth(),
    getMemberships(),
    getWeddingMembers(current.wedding.id),
  ]);

  const otherMembers = members
    .filter((m) => m.user.id !== current.userId)
    .map((m) => ({ userId: m.user.id, name: m.user.name, email: m.user.email }));

  return (
    <div className="animate-fade-in">
      <div className="text-[11px] tracking-[0.16em] uppercase text-accent-hover font-bold">
        更多
      </div>
      <h1 className="text-[25px] md:text-[30px] font-bold tracking-tight mt-0.5 mb-3">
        更多功能
      </h1>

      <div className="flex flex-col gap-6">
        {memberships.length > 1 && (
          <WeddingListSwitcher
            activeWeddingId={current.wedding.id}
            memberships={memberships.map((m) => ({
              weddingId: m.weddingId,
              name: m.wedding.name,
              role: m.role,
            }))}
          />
        )}

        <div>
          <div className="font-bold text-[15px] mb-2">活動資訊</div>
          <EventForm
            weddingId={current.wedding.id}
            initial={{
              name: current.wedding.name,
              weddingDate: current.wedding.weddingDate,
              venueName: current.wedding.venueName,
              venueDetail: current.wedding.venueDetail,
              totalBudget: toNumOrNull(current.wedding.totalBudget),
            }}
          />
        </div>

        <Link href="/more/collaborators" className="panel text-left card-interactive">
          <div className="font-bold text-[15px]">協作者管理</div>
          <div className="text-text-soft text-sm mt-0.5">邀請家人或婚顧一起規劃</div>
        </Link>

        <div>
          <div className="font-bold text-[15px] mb-2">帳號</div>
          <div className="panel mb-3.5">
            <div className="text-sm font-medium">{session?.user?.email ?? "目前帳號"}</div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
              className="mt-3"
            >
              <button type="submit" className="btn btn-secondary">
                登出
              </button>
            </form>
          </div>

          <AccountSection
            weddingId={current.wedding.id}
            weddingName={current.wedding.name}
            isOwner={isOwner}
            otherMembers={otherMembers}
          />
        </div>
      </div>
    </div>
  );
}
