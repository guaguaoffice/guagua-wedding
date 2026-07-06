import Link from "next/link";
import { requireCurrentWedding, getMemberships } from "@/lib/wedding";
import { getWeddingMembers } from "@/lib/queries";
import { auth, signOut } from "@/lib/auth";
import { toNumOrNull } from "@/lib/decimal";
import { prisma } from "@/lib/prisma";
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
  const weddingId = current.wedding.id;
  const [session, memberships, members, guestCount, tableCount] = await Promise.all([
    auth(),
    getMemberships(),
    getWeddingMembers(weddingId),
    prisma.guest.count({ where: { weddingId, attending: true } }),
    prisma.table.count({ where: { weddingId } }),
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
          <Link href="/more/weddings" className="panel card-interactive block">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <div className="font-bold text-[17px] leading-snug">{current.wedding.name}</div>
                <div className="text-xs text-text-soft mt-0.5">
                  {ROLE_LABEL[current.role]}
                  {memberships.length > 1 && ` · 共 ${memberships.length} 場`}
                </div>
              </div>
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-text-faint fill-none flex-none mt-0.5" strokeWidth={2}>
                <path d="M9 6l6 6-6 6" />
              </svg>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-bg rounded-xl p-3">
                <div className="text-[10px] text-text-faint font-medium mb-1">婚禮日期</div>
                <div className="text-sm font-semibold leading-snug">
                  {current.wedding.weddingDate
                    ? new Date(current.wedding.weddingDate).toLocaleDateString("zh-Hant", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC" })
                    : "—"}
                </div>
              </div>
              <div className="bg-bg rounded-xl p-3">
                <div className="text-[10px] text-text-faint font-medium mb-1">出席人數</div>
                <div className="text-sm font-semibold">{guestCount} 人</div>
              </div>
              <div className="bg-bg rounded-xl p-3">
                <div className="text-[10px] text-text-faint font-medium mb-1">桌數</div>
                <div className="text-sm font-semibold">{tableCount} 桌</div>
              </div>
            </div>
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
          />
        </div>
      </div>
    </div>
  );
}
