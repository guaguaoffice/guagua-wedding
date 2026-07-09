import Link from "next/link";
import { requireCurrentWedding, getMemberships } from "@/lib/wedding";
import { getWeddingMembers } from "@/lib/queries";
import { auth, signOut } from "@/lib/auth";
import { toNumOrNull } from "@/lib/decimal";
import { EventForm } from "@/app/more/EventForm";
import { AccountSection } from "@/app/more/AccountSection";
import { ProfileForm } from "@/app/more/ProfileForm";

const ROLE_LABEL: Record<string, string> = {
  OWNER: "主辦人",
  COLLABORATOR: "協作者",
  VIEWER: "檢視者",
};

export default async function MorePage() {
  const current = await requireCurrentWedding();

  const isOwner = current.role === "OWNER";
  const [session, memberships, members] = await Promise.all([
    auth(),
    getMemberships(),
    getWeddingMembers(current.wedding.id),
  ]);

  const otherMembers = members
    .filter((m) => m.user.id !== current.userId)
    .map((m) => ({ userId: m.user.id, name: m.user.name, email: m.user.email }));
  const selfMember = members.find((m) => m.user.id === current.userId);

  return (
    <div className="animate-fade-in">
      <div className="text-[11px] tracking-[0.16em] uppercase text-accent-hover font-bold">
        更多
      </div>
      <h1 className="text-[25px] md:text-[30px] font-bold tracking-tight mt-0.5 mb-3">
        更多功能
      </h1>

      <div className="flex flex-col gap-6">
        <div>
          <div className="font-bold text-[15px] mb-2">我的婚禮</div>
          <Link
            href="/more/weddings"
            className="panel card-interactive flex items-center justify-between gap-3"
          >
            <div>
              <div className="text-sm font-medium">{current.wedding.name}</div>
              <div className="text-xs text-text-soft mt-0.5">
                目前顯示 · {ROLE_LABEL[current.role]}
                {memberships.length > 1 && ` · 共 ${memberships.length} 場婚禮`}
              </div>
            </div>
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-text-faint fill-none flex-none" strokeWidth={2}>
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

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

        <div>
          <div className="font-bold text-[15px] mb-2">協作者管理</div>
          <Link
            href="/more/collaborators"
            className="panel card-interactive flex items-center justify-between gap-3"
          >
            <div className="text-sm font-medium">邀請家人或婚顧一起規劃</div>
            <svg
              viewBox="0 0 24 24"
              className="w-[18px] h-[18px] stroke-text-faint fill-none flex-none"
              strokeWidth={2}
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

        <div>
          <div className="font-bold text-[15px] mb-2">帳號</div>
          <div className="panel flex flex-col gap-3.5 mb-3.5">
            <div>
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

            <hr className="border-border" />

            <ProfileForm
              weddingId={current.wedding.id}
              initialName={session?.user?.name ?? null}
              initialIdentity={selfMember?.identity ?? null}
            />
          </div>

          <AccountSection
            weddingId={current.wedding.id}
            weddingName={current.wedding.name}
            isOwner={isOwner}
            otherMembers={otherMembers}
            userEmail={session?.user?.email ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
