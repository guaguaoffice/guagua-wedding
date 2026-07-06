import { requireCurrentWedding, getMemberships, createOwnWedding } from "@/lib/wedding";
import { BackToMore } from "@/components/BackToMore";
import { WeddingListSwitcher } from "@/app/more/WeddingListSwitcher";
import { prisma } from "@/lib/prisma";

export default async function WeddingsPage() {
  const current = await requireCurrentWedding();
  const memberships = await getMemberships();

  const stats = await Promise.all(
    memberships.map(async (m) => {
      const [guestCount, tableCount] = await Promise.all([
        prisma.guest.count({ where: { weddingId: m.weddingId, attending: true } }),
        prisma.table.count({ where: { weddingId: m.weddingId } }),
      ]);
      return { weddingId: m.weddingId, guestCount, tableCount };
    })
  );
  const statsMap = Object.fromEntries(stats.map((s) => [s.weddingId, s]));

  return (
    <div className="animate-fade-in">
      <BackToMore />
      <div className="text-[11px] tracking-[0.16em] uppercase text-accent-hover font-bold">
        更多
      </div>
      <h1 className="text-[25px] md:text-[30px] font-bold tracking-tight mt-0.5 mb-3">
        我的婚禮
      </h1>
      <p className="text-text-soft text-sm mb-4">
        這個帳號主辦或協作的所有婚禮，點一下即可切換目前顯示的婚禮。
      </p>

      <WeddingListSwitcher
        activeWeddingId={current.wedding.id}
        memberships={memberships.map((m) => ({
          weddingId: m.weddingId,
          name: m.wedding.name,
          role: m.role,
          weddingDate: m.wedding.weddingDate?.toISOString() ?? null,
          guestCount: statsMap[m.weddingId]?.guestCount ?? 0,
          tableCount: statsMap[m.weddingId]?.tableCount ?? 0,
        }))}
      />

      <form
        action={async () => {
          "use server";
          await createOwnWedding();
        }}
        className="mt-4"
      >
        <button type="submit" className="btn btn-secondary w-full">
          ＋ 建立另一場新婚禮
        </button>
      </form>
    </div>
  );
}
